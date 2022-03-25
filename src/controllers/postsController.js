import postsRepository from "../repositories/postsRepository.js";
import urlMetadata from "url-metadata";
import { createHashtags, createRelation } from "../services/hashtagsService.js";
import postsService from "../services/postsService.js";

import NotFound from "../errors/NotFoundError.js";
import Unauthorized from "../errors/UnauthorizedError.js";
import connection from "../db.js";

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

    const { insertQuery, allHashtagsInPost } = await createHashtags(description);

    await postsRepository.insert(postData);

    if (allHashtagsInPost.length > 0) {
      await createRelation(user.id, insertQuery, allHashtagsInPost);
    }

    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
}

export async function allPosts(_req, res) {
  try {
    const { rows: posts } = await postsRepository.posts()

    res.send(posts);
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
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

export async function updatePost(req, res) {
  const { user } = res.locals;
  const { id } = req.params;
  const post = req.body;
  if(!post || !id){
    res.sendStatus(400);
    return;
  }

  try {
    await connection.query(`
      UPDATE posts 
        SET description=$1 
      WHERE id=$2 AND "userId"=$3
    `, [post.description, id, user.id]);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}