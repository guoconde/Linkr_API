import * as postsService from "../services/postsService.js";
import * as likesRepository from "../repositories/likeRepository.js";
import * as hashtagsRepository from "../repositories/hashtagsRepository.js";
import { findHashtags } from "../utils/findHashtags.js";
import { repeatedHashtags } from "../utils/repeatedHashtags.js";
import { newHashtags } from "../utils/newHashtags.js";
import { deletedHashtags } from "../utils/deletedHashtags.js";
import { newHashtagsNotInserted } from "../utils/newHashtagsNotInserted.js";
import { hashtagsToBeDeleted } from "../utils/hashtagsToBeDeleted.js";
import NotFound from "../errors/NotFoundError.js";
import Unauthorized from "../errors/UnauthorizedError.js";
import NoContent from "../errors/NoContentError.js";
import connection from "../db.js";
import BadRequest from "../errors/badRequest.js";

export async function createPost(req, res) {
  const { user } = res.locals;
  const { url, description } = req.body;

  try {
    await postsService.createPost(url, description, user);

    res.sendStatus(201);
  } catch (error) {
    if (error instanceof BadRequest) return res.status(error.status).send(error.message);

    console.log(error);
    res.sendStatus(500);
  }
}

export async function repost(req, res) {
  const { user } = res.locals;
  const { id } = req.params;

  try {
    const result = await postsService.repost(user.id, id);

    if (result === "deleted") return res.sendStatus(200);

    res.sendStatus(201);
  } catch (error) {
    if (error instanceof BadRequest) return res.status(error.status).send(error.message);

    console.log(error);
    res.sendStatus(500);
  }
}

export async function deletePost(req, res) {
  const { user } = res.locals;
  let { id: postId } = req.params;

  try {
    await postsService.deletePost(user, postId);

    res.sendStatus(200);
  } catch (error) {
    if (error instanceof NotFound || error instanceof Unauthorized) {
      return res.status(error.status).send(error.message);
    }

    console.log(error);
    res.sendStatus(500);
  }
}

export async function updatePost(req, res) {
  const { user } = res.locals;
  const { id } = req.params;
  const post = req.body;
  if (!post || !id) {
    res.sendStatus(400);
    return;
  }

  try {
    const originalHashtags = findHashtags(post.originalDescription);
    const currentHashtags = findHashtags(post.description);

    const isRepeatedHashtags = repeatedHashtags(currentHashtags);
    if(isRepeatedHashtags){
      res.status(400).send("Unable to edit, repeated hashtags, try again!");
      return;
    }

    await postsService.updatePostDescription(post.description, id, user.id);

    const newHashtagsFound = newHashtags(currentHashtags, originalHashtags);
    const deletedHashtagsFound = deletedHashtags(newHashtagsFound, originalHashtags, currentHashtags);

    if (newHashtagsFound.length) {
      const searchNewHashtags = newHashtagsFound.map(h => `name='${h}'`).join(` OR `);

      const seachedHastags = await hashtagsRepository.specificsHashtags(searchNewHashtags);

      const newHashtagsNotInsertedFound = newHashtagsNotInserted(newHashtagsFound, seachedHastags);
      if (newHashtagsNotInsertedFound.length > 0) {
        const hashtagNotInserted = newHashtagsNotInsertedFound.map(h => `('${h}')`).join(`, `);
        await hashtagsRepository.insert(hashtagNotInserted);
      }

      const searchCurrentHashtags = currentHashtags.map(h => `name='${h}'`).join(` OR `);
      const searchAllHastags = await hashtagsRepository.specificsHashtags(searchCurrentHashtags);

      await hashtagsRepository.deleteHashtagsRelation(id);

      const hashtagRelations = searchAllHastags.rows.map(h => `('${h.id}', ${id})`).join(`, `);
      await hashtagsRepository.insertHashtagsRelation(hashtagRelations);
    } else if (deletedHashtagsFound.length) {
      if (deletedHashtagsFound.length === originalHashtags.length &&
        originalHashtags.length !== 0) {

        await hashtagsRepository.deleteHashtagsRelation(id);

        const searchOriginalHashtags = originalHashtags.map(h => `name='${h}'`).join(` OR `);
        const searchAllHastags = await hashtagsRepository.specificsHashtags(searchOriginalHashtags);

        const searchUsedHashtagsArr = searchAllHastags.rows.map(h => `"hashtagId"='${h.id}'`).join(` OR `);
        const searchUsedHashtags = await hashtagsRepository.specificsHashtagsRelation(searchUsedHashtagsArr);

        const hashtagsToBeDeletedFound = hashtagsToBeDeleted(searchAllHastags, searchUsedHashtags);
        if (hashtagsToBeDeletedFound.length) {
          const searchToBeDeleteHashtags = hashtagsToBeDeletedFound.map(h => `id='${h.id}'`).join(` OR `);
          await hashtagsRepository.deleteSpecificsHashtags(searchToBeDeleteHashtags);
        }
      } else {
        const searchDeletedHashtagsArr = deletedHashtagsFound.map(h => `name='${h}'`).join(` OR `);
        const searchDeletedHashtags = await hashtagsRepository.specificsHashtags(searchDeletedHashtagsArr);

        const searchToBeDeleteHashtagsInPost = searchDeletedHashtags.rows.map(h => `"hashtagId"='${h.id}'`).join(` OR `);
        await hashtagsRepository.deleteHashtagsRelationInPost(id, searchToBeDeleteHashtagsInPost);

        const searchUsedHashtagsArr = searchDeletedHashtags.rows.map(h => `"hashtagId"='${h.id}'`).join(` OR `);
        const searchUsedHashtags = await hashtagsRepository.specificsHashtagsRelation(searchUsedHashtagsArr);
        
        const hashtagsToBeDeletedFound = hashtagsToBeDeleted(searchDeletedHashtags, searchUsedHashtags);
        if (hashtagsToBeDeletedFound.length) {
          const searchToBeDeleteHashtags = hashtagsToBeDeletedFound.map(h => `id='${h.id}'`).join(` OR `);
          await hashtagsRepository.deleteSpecificsHashtags(searchToBeDeleteHashtags);
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}

export async function listPosts(req, res) {
  const { id, hashtag } = req.params;
  const { user } = res.locals;
  const { limit } = req.query;

  try {
    const posts = await postsService.list(user.id, id, hashtag, limit);

    res.send(posts);
  } catch (error) {
    if (error instanceof NoContent || error instanceof NotFound) return res.status(error.status).send(error.message);

    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}

export async function deleteLike(req, res) {
  const { id } = req.params;
  const { isLiked, userId } = req.body;

  try {
    await likesRepository.deleteLike(id, userId, isLiked);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}

export async function newLike(req, res) {
  const { id } = req.params;
  const { isLiked, userId } = req.body;

  try {
    await likesRepository.insertLike(id, userId, isLiked);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}
