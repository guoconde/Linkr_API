import postsRepository from "../repositories/postsRepository.js";
import urlMetadata from "url-metadata";
import { createHashtags, createRelation } from "../services/hashtagsService.js";
import postsService from "../services/postsService.js";
import * as userRepository from "../repositories/userRepository.js"

import NotFound from "../errors/NotFoundError.js";
import Unauthorized from "../errors/UnauthorizedError.js";
import NoContent from "../errors/NoContentError.js";
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

export async function listPosts(req, res) {
    const { id, hashtag } = req.params
    const { user } = res.locals;

    try {
        const posts = await postsService.list(user.id, id, hashtag)
        const { rows: names } = await postsRepository.getNameByLikes()

        const postsWithLikes = posts.map((el, i) => {
            const filteredNames = names.filter(post => post.postId === el.id)

            const likeNames = filteredNames.map(element => element.userName )

            let newArr = {...el, likeNames}

            return newArr

        })

        if(id){
          const user = await userRepository.find('id', id)
          if(!user) throw new NotFound("User doesn't exists")

          return res.send({name:user.name, posts:postsWithLikes})
        }
        
        res.send(postsWithLikes);
    } catch (error) {
        if (error instanceof NoContent || error instanceof NotFound) return res.status(error.status).send(error.message);

        console.log(error);
        res.status(500).send("Unexpected server error")
    }
}

export async function deleteLike(req, res) {
    const { id } = req.params
    const { isLiked, userId } = req.body
    
    try {
        await postsRepository.deleteLike(id, userId, isLiked)
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.status(500).send("Unexpected server error")
    }
}

export async function newLike(req, res) {
    const { id } = req.params
    const { isLiked, userId } = req.body

    try {
        await postsRepository.insertLike(id, userId, isLiked)
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.status(500).send("Unexpected server error")
    }
}