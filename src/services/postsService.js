import { hashtagsPostsRepository } from "../repositories/hashtagsPostsRepository.js";
import { hashtagsRepository } from "../repositories/hashtagsRepository.js";
import postsRepository from "../repositories/postsRepository.js";
import * as userRepository from "../repositories/userRepository.js"

import NotFound from "../errors/NotFoundError.js";
import Unauthorized from "../errors/UnauthorizedError.js";

async function list(userId, userSearchedId, hashtagName){
  let where = ""
  let queryArgs = [userId]
  let hashtagRelation = ""
  let repostsWhere = ""
  
  if(hashtagName){
    where += "WHERE hashtags.name = $2"
    repostsWhere= `
    WHERE  "sharerId" IS NULL
    `
    queryArgs.push(`#${hashtagName}`)
    hashtagRelation = `
    LEFT JOIN "hashtagsPosts" ON "hashtagsPosts"."postId" = posts.id
    LEFT JOIN hashtags ON hashtags.id = "hashtagsPosts"."hashtagId"
    `
  } else if (userSearchedId){
    where += "WHERE users.id = $2"
    repostsWhere= `
    WHERE  "sharerId" = $2
    `
    queryArgs.push(userSearchedId)
  } else {
    repostsWhere= `
    WHERE  "sharerId" IN (SELECT "followedId" FROM followers WHERE "followerId"=$1)
    `
    where = `WHERE posts."userId" 
      IN (SELECT "followedId" FROM followers WHERE "followerId"=$1) OR posts."userId"=$1 
    `;
  }

  const posts =  await postsRepository.list(where ,queryArgs, hashtagRelation, repostsWhere)
  const isFollowingSomeone = await userRepository.findFollowed(userId);
  const { rows: names } = await postsRepository.getNameByLikes()

  const postsWithLikes = posts.map((el) => {
    const filteredNames = names.filter(post => post.postId === el.id)
    const likeNames = filteredNames.map(element => element.userName)

    return { ...el, likeNames }
  })

  if (userSearchedId) {
    const searchedUser = await userRepository.find('id', userSearchedId)
    if (!searchedUser) throw new NotFound("User doesn't exists")

    let isFollowing = null;
    if (userId !== parseInt(userSearchedId)) {
      isFollowing = await userRepository.findRelationOfFollow(userId, [userSearchedId]);
      if (isFollowing.rowCount === 0) {
        isFollowing = false;
      } else {
        isFollowing = true;
      }
    }

    return { name: searchedUser.name, posts: postsWithLikes, isFollowing, photo: searchedUser.photo } 
  }
  
  return {posts: postsWithLikes, isFollowingSomeone};
}

async function findOne(postId, userId) {
  const postExist = await postsRepository.findOne(postId);

  if(postExist.rowCount === 0) throw new NotFound(`Post doesn't exist`);

  if (postExist.rows[0].userId !== userId) throw new Unauthorized("You can't delete this")

  return true;
}

async function repost(userId, postId) {
  const deleted = await postsRepository.deleteRepost(userId, postId);
  if (deleted) return "deleted"
  
  const result = await postsRepository.createRepost(userId, postId);
  if (!result) throw new Error();

  return "created";
}

async function deletePostHashtags(postId, userId) {
  const hashtagsInPost = await hashtagsRepository.findHashtagsInPost(postId, userId);
  
  if (hashtagsInPost.length > 0){
    const hashtagIsInOtherPosts = await hashtagsRepository.findHashtagInOtherPosts(hashtagsInPost, postId);

    await hashtagsPostsRepository.deleteHashtagsRelation(postId);
    
    await hashtagsRepository.deleteMany(hashtagIsInOtherPosts, hashtagsInPost);
  }

  return true;
}

const postsService = {
  list,
  findOne,
  deletePostHashtags,
  repost
}

export default postsService;