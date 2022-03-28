import { hashtagsPostsRepository } from "../repositories/hashtagsPostsRepository.js";
import { hashtagsRepository } from "../repositories/hashtagsRepository.js";
import postsRepository from "../repositories/postsRepository.js";

import NotFound from "../errors/NotFoundError.js";
import Unauthorized from "../errors/UnauthorizedError.js";

async function list(userId, userSearchedId, hashtagName){
  let where = ""
  let queryArgs = [userId]

  if(hashtagName){
    where = "WHERE hashtags.name = $2"
    queryArgs.push(`#${hashtagName}`)
  }else if (userSearchedId){
    where = "WHERE users.id = $2"
    queryArgs.push(userSearchedId)
  }
  
  const posts =  await postsRepository.list(where ,queryArgs)
  if (!posts) return [];
  
  return posts;
}

async function findOne(postId, userId) {
  const postExist = await postsRepository.findOne(postId);

  if(postExist.rowCount === 0) throw new NotFound(`Post doesn't exist`);

  if (postExist.rows[0].userId !== userId) throw new Unauthorized("You can't delete this")

  return true;
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
  deletePostHashtags
}

export default postsService;