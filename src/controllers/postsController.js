import postsRepository from "../repositories/postsRepository.js";
import { createHashtags, createRelation } from "../services/hashtagsService.js";

export async function createPost(req, res) {
  const { user } = res.locals;
  const { url, description } = req.body;
  
  try {
    const { hashtagsQuery, hashtagsInPost } = await createHashtags(description);
      
    await postsRepository.insert(user.id, description, url);

    if (hashtagsInPost.length > 0) {
      createRelation(user.id, hashtagsQuery, hashtagsInPost);
    }

    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
}