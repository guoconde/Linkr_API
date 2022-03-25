import { hashtagsRepository } from "../repositories/hashtagsRepository.js";
import { findHashtags } from "../utils/findHashtags.js";
import { getNonexistentHashtags } from "../utils/getNonexistentHashtags.js";
import postsRepository from "../repositories/postsRepository.js";
import { hashtagsPostsRepository } from "../repositories/hashtagsPostsRepository.js"
import toArrayOfIds from "../utils/toArrayOfIds.js";

export async function createHashtags(description) {
  const filteredHashtagsInPost = findHashtags(description, true);
  const hashtagsQuery = filteredHashtagsInPost.map((h, index) => `$${index + 1}`).join(", ");

  let result;
  if (hashtagsQuery) {
    result = await hashtagsRepository.find(hashtagsQuery, filteredHashtagsInPost);
  }

  const hashtagsToBeCreated = getNonexistentHashtags(filteredHashtagsInPost, result);

  if (hashtagsToBeCreated) {
    await hashtagsRepository.insert(hashtagsToBeCreated);
  }

  const allHashtagsInPost = findHashtags(description, false);
  const insertQuery = allHashtagsInPost.map((h, index) => `$${index + 1}`).join(", ");

  return { insertQuery, allHashtagsInPost };
}

export async function createRelation(userId, insertQuery, hashtags) {
  const { rows: [post] } = await postsRepository.findLatestPost(userId);
  let { rows: hashtagsInPost } = await hashtagsRepository.find(insertQuery, hashtags);
  
  hashtagsInPost = hashtags.map(h => {
    const item = hashtagsInPost.find((obj) => obj.name === h);
    return item.id;
  })
  
  const hashtagRelations = hashtagsInPost.map(h => `('${h}', ${post.id})`).join(`, `);
  
  await hashtagsPostsRepository.insert(hashtagRelations);

  return true;
}
