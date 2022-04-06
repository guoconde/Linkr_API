import * as postsRepository from "../repositories/postsRepository.js";
import * as userRepository from "../repositories/userRepository.js"
import * as repostRepository from "../repositories/repostsRepository.js";
import * as hashtagService from "../services/hashtagsService.js";
import * as likeRepository from "../repositories/likeRepository.js";
import * as commentsRepository from "../repositories/commentsRepository.js";
import * as geolocationRepository from "../repositories/geolocationRepository.js";
import urlMetadata from "url-metadata";
import NotFound from "../errors/NotFoundError.js";
import Unauthorized from "../errors/UnauthorizedError.js";
import BadRequest from "../errors/badRequest.js";

export async function list(userId, userSearchedId, hashtagName, limit){
  let where = "";
  let queryArgs = [userId];
  let hashtagRelation = "";
  let repostsWhere = "";
  
  if(hashtagName){
    where += "WHERE hashtags.name = $2";
    repostsWhere = `WHERE "sharerId" IS NULL`;

    queryArgs.push(`#${hashtagName}`);
    hashtagRelation = `
      LEFT JOIN "hashtagsPosts" ON "hashtagsPosts"."postId" = posts.id
      LEFT JOIN hashtags ON hashtags.id = "hashtagsPosts"."hashtagId"
    `;
  } else if (userSearchedId){
    where += "WHERE users.id = $2";
    repostsWhere = `WHERE  "sharerId" = $2`;

    queryArgs.push(userSearchedId);
  } else {
    repostsWhere = `
      WHERE  "sharerId" 
      IN (SELECT "followedId" FROM followers WHERE "followerId"=$1)
    `;
    where = `
      WHERE posts."userId" 
      IN (SELECT "followedId" FROM followers WHERE "followerId"=$1)
    `;
  }

  const totalPosts = await postsRepository.getCountPosts(userId);
  const posts =  await postsRepository.list(where ,queryArgs, hashtagRelation, repostsWhere, limit);
  const isFollowingSomeone = await userRepository.findFollowed(userId);
  const { rows: names } = await likeRepository.getNameByLikes();

  const postsWithLikes = posts.map((el) => {
    const filteredNames = names.filter(post => post.postId === el.id);
    const likeNames = filteredNames.map(element => element.userName);

    return { ...el, likeNames };
  });

  if (userSearchedId) {
    const searchedUser = await userRepository.find('id', userSearchedId);
    if (!searchedUser) throw new NotFound("User doesn't exists");

    let isFollowing = null;
    if (userId !== parseInt(userSearchedId)) {
      isFollowing = await userRepository.findRelationOfFollow(userId, [userSearchedId]);
      if (isFollowing.rowCount === 0) {
        isFollowing = false;
      } else {
        isFollowing = true;
      }
    }

    return { name: searchedUser.name, posts: postsWithLikes, isFollowing, photo: searchedUser.photo };
  }
  
  const getCountPosts = parseInt(totalPosts.rows[0].count) + parseInt(totalPosts.rows[1].count);

  return {posts: postsWithLikes, isFollowingSomeone, getCountPosts};
}

export async function findOne(postId, userId) {
  const postExist = await postsRepository.findOne(postId);

  if(postExist.rowCount === 0) throw new NotFound(`Post doesn't exist`);

  if (postExist.rows[0].userId !== userId) throw new Unauthorized("You can't delete this");

  return true;
}

export async function repost(userId, postId) {
  const deleted = await repostRepository.deleteRepost(userId, postId);
  if (deleted) return "deleted";
  
  const result = await repostRepository.createRepost(userId, postId);
  if (!result) throw new Error();

  return "created";
}

export async function createPost(url, description, user){
  const metadata = await urlMetadata(url);

  const postData = {
    userId: user.id,
    description,
    url,
    metadataDescription: metadata.description,
    metadataImage: metadata.image,
    metadataTitle: metadata.title
  }

  if (!postData.metadataImage) {
    delete postData.metadataImage;
  }

  await postsRepository.insert(postData);
  
  const { insertQuery, filteredHashtagsInPost } = await hashtagService.createHashtags(description);

  if (filteredHashtagsInPost.length > 0) {
    await hashtagService.createRelation(user.id, insertQuery, filteredHashtagsInPost);
  }
}

export async function lastPost(userId) {
  const promise = await postsRepository.lastPost(userId);

  return promise;
}

export async function deletePost(user, postId){
  if (isNaN(postId)) throw new BadRequest();

  await findOne(postId, user.id);

  await hashtagService.deletePostHashtags(postId, user.id);

  await likeRepository.deleteLikesRelation(postId);
  
  await repostRepository.deleteRepostsRelation(postId);

  await commentsRepository.deleteComments(postId);

  await geolocationRepository.deleteGeolocation(postId);

  await postsRepository.deletePost(postId);
}

export async function updatePostDescription(description, postId, userId) {
  if (isNaN(postId)) throw new BadRequest();
  
  await postsRepository.updatePostDescription(description, postId, userId);
}