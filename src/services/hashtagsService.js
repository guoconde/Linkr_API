import { hashtagsRepository } from "../repositories/hashtagsRepository.js";
import { findHashtags } from "../utils/findHashtags.js";
import { getNonexistentHashtags } from "../utils/getNonexistentHashtags.js";
import postsRepository from "../repositories/postsRepository.js";
import { hashtagsPostsRepository } from "../repositories/hashtagsPostsRepository.js"

export async function createHashtags(description) {
  const hashtagsInPost = findHashtags(description);
  const hashtagsQuery = hashtagsInPost.map((h, index) => `$${index + 1}`).join(", ");

  let result;
  if (hashtagsQuery) {
    result = await hashtagsRepository.find(hashtagsQuery, hashtagsInPost);
  }

  const hashtagsToBeCreated = getNonexistentHashtags(hashtagsInPost, result);

  if (hashtagsToBeCreated) {
    await hashtagsRepository.insert(hashtagsToBeCreated);
  }

  return { hashtagsQuery, hashtagsInPost }
}

export async function createRelation(userId, params, hashtags) {
  const { rows: [post] } = await postsRepository.findLatestPost(userId);

  const { rows: hashtagsInPost } = await hashtagsRepository.find(params, hashtags);

  const hashtagRelations = hashtagsInPost.map(h => `('${h.id}', ${post.id})`).join(`, `);
  
  await hashtagsPostsRepository.insert(hashtagRelations);

  return true;
}
