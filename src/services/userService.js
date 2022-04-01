import Conflict from "../errors/Conflict.js";
import * as userRepository from "../repositories/userRepository.js";
import bcrypt from 'bcrypt';

export async function register({ username, email, password, picture }) {
  const searchedUser = await userRepository.find("email", email);
  if (searchedUser) throw new Conflict("E-mail already registered");

  const passwordHashed = bcrypt.hashSync(password, 10);

  const result = userRepository.insert(username, email, passwordHashed, picture);
  if (!result) throw new Error();
}

export async function findUsers(find, user) {
  if (!find) return [];

  const data = await userRepository.findUsersInput([find]);
  
  const matchesIds = data.map(user => user.id);
  if (matchesIds.length > 0) {
    const { rows: userIsFollowing } = await userRepository.findRelationOfFollow(user.id, matchesIds);
    const users = data.map(user => {
      const isFollowing = userIsFollowing.find(u => user.id === u.followedId);
      if (isFollowing) {
        return { ...user, isFollowing: true }
      } else {
        return { ...user, isFollowing: false }
      }
    });
  
    users.sort((user1, user2) => {
      const isEquivalent = user1.isFollowing === user2.isFollowing;
      return (isEquivalent) ? 0 : user1.isFollowing ? -1 : 1;
    });
  
    return users;
  } else {
    return [];
  }
}

export async function newFollow(followedId, user) {
  if (isNaN(followedId)) throw new BadRequest();

  const isFollowing = await userRepository.findRelationOfFollow(user.id, [followedId]);

  if (isFollowing.rowCount > 0) {
    const [data] = isFollowing.rows;
    await userRepository.unfollow(data.id);
  } else {
    await userRepository.follow(user.id, followedId);
  }
}