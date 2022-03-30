import connection from "../db.js";
import bcrypt from 'bcrypt';
import * as usersRepository from "../repositories/userRepository.js"
import BadRequest from "../errors/badRequest.js";

export async function register(req, res) {
  const { username, email, password, picture } = req.body;

  try {
    const searchedUser = await connection.query(`
      SELECT 
        *
      FROM users
      WHERE email=$1
    `, [email]);
    if (searchedUser.rowCount !== 0) {
      res.sendStatus(409);
      return;
    }

    const passwordHashed = bcrypt.hashSync(password, 10);

    await connection.query(`
      INSERT INTO users 
        (name, email, password, photo)
      VALUES
        ($1, $2, $3, $4)
    `, [username, email, passwordHashed, picture]);

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function findUsers(req, res) {
  const { find } = req.query;
  const { user } = res.locals;

  try {
    if (!find) {
      return res.send([]);
    }
    
    const data = await usersRepository.findUsersInput([find]);
   
    const matchesIds = data.map(user => user.id);
    
    const { rows: userIsFollowing } = await usersRepository.findRelationOfFollow(user.id, matchesIds);

    const result = data.map(user => {
      const isFollowing = userIsFollowing.find(u => user.id === u.followedId);
      if (isFollowing) {
        return {...user, isFollowing: true}
      } else {
        return {...user, isFollowing: false}
      }
    });
    
    result.sort((user1, user2) => {
      const isEquivalent = user1.isFollowing === user2.isFollowing
      return (isEquivalent) ? 0 : user1.isFollowing ? -1 : 1;
    });

    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error")
  }
}

export async function newFollow(req, res) {
  const { followedId } = req.body;
  const { user } = res.locals;
  
  try {
    if (isNaN(followedId)) throw new BadRequest;

    const isFollowing = await usersRepository.findRelationOfFollow(user.id, [followedId]);

    if (isFollowing.rowCount > 0){
      const [data] = isFollowing.rows; 
      await usersRepository.unfollow(data.id);
    } else {
      await usersRepository.follow(user.id, followedId);
    }

    return res.sendStatus(200);   
  } catch (error) {
    if(error instanceof BadRequest) res.status(error.status).send(error.message);
    console.log(error);
    res.sendStatus(500);
  }
}