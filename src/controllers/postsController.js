import postsRepository from "../repositories/postsRepository.js";
import urlMetadata from "url-metadata";
import { createHashtags, createRelation } from "../services/hashtagsService.js";
import postsService from "../services/postsService.js";

import NotFound from "../errors/NotFoundError.js";
import Unauthorized from "../errors/UnauthorizedError.js";

export async function createPost(req, res) {
  const { user } = res.locals;
  const { url, description } = req.body;
  
  try {
    const metadata = await urlMetadata(url);

    const postData = {
      userId: user.id,
      description,
      url,
      metadataDescription: metadata.description,
      metadataImage: metadata.image,
      metadataTitle: metadata.title
    }

    const { hashtagsQuery, hashtagsInPost } = await createHashtags(description);
      
    await postsRepository.insert(postData);

    if (hashtagsInPost.length > 0) {
      createRelation(user.id, hashtagsQuery, hashtagsInPost);
    }

    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
}
export async function allPosts(req, res) {

  try {
    const { rows: posts } = await postsRepository.posts()
    const likes = await feedRepository.getAllLikes(id)

    res.send(posts, likes);
  } catch (error) {
    res.sendStatus(500);
    console.log(error)
  }
}

export async function deletePost(req, res) {
  const { user } = res.locals;
  let { id: postId } = req.params;

  if (isNaN(postId)) {
    res.sendStatus(404);
  }

  try {
    await postsService.findOne(postId, user.id);

    await postsService.deletePostHashtags(postId, user.id);

    await postsRepository.deletePost(postId);

    res.sendStatus(200);
  } catch (error) {
    if (error instanceof NotFound || error instanceof Unauthorized)  {
      return res.status(error.status).send(error.message);
    }
    res.sendStatus(500);
  }
}