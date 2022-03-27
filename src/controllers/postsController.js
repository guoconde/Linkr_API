import postsRepository from "../repositories/postsRepository.js";
import urlMetadata from "url-metadata";
import { createHashtags, createRelation } from "../services/hashtagsService.js";
import postsService from "../services/postsService.js";
import * as userRepository from "../repositories/userRepository.js"
import { hashtagsPostsRepository } from "../repositories/hashtagsPostsRepository.js";

import { findHashtags } from "../utils/findHashtags.js";
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

    await hashtagsPostsRepository.deleteLikesRelation(postId);

    await postsRepository.deletePost(postId);

    res.sendStatus(200);
  } catch (error) {
    if (error instanceof NotFound || error instanceof Unauthorized) {
      return res.status(error.status).send(error.message);
    }
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

    for (let i = 0; i < currentHashtags.length; i++) {
      let newHashtag = currentHashtags[i];
      if (currentHashtags.indexOf(newHashtag) !== -1 &&
        currentHashtags.indexOf(newHashtag) !== i) {
          res.status(400).send("Unable to edit, repeated hashtags, try again!");
          return;
      }
    }

    await connection.query(`
      UPDATE posts 
        SET description=$1 
      WHERE id=$2 AND "userId"=$3
    `, [post.description, id, user.id]);

    const newHashtags = [];
    for (let i = 0; i < currentHashtags.length; i++) {
      const hashtag = currentHashtags[i];
      if (originalHashtags.indexOf(hashtag) === -1) {
        newHashtags.push(hashtag);
      }
    }

    const deletedHashtags = [];
    if (!newHashtags.length && originalHashtags.length > currentHashtags.length) {
      for (let i = 0; i < originalHashtags.length; i++) {
        const hashtag = originalHashtags[i];
        if (currentHashtags.indexOf(hashtag) === -1) {
          deletedHashtags.push(hashtag);
        }
      }
    }

    if (newHashtags.length) {
      const searchNewHashtags = newHashtags.map(h => `name='${h}'`).join(` OR `);
      const seachedHastags = await connection.query(`
        SELECT 
          *
        FROM hashtags
          WHERE ${searchNewHashtags}
      `);

      const newHashtagsNotInserted = [];
      for (let i = 0; i < newHashtags.length; i++) {
        const hashtag = newHashtags[i];
        if (!seachedHastags.rows.find(h => h.name === hashtag)) {
          newHashtagsNotInserted.push(hashtag);
        }
      }

      if (newHashtagsNotInserted.length > 0) {
        const hashtagNotInserted = newHashtagsNotInserted.map(h => `('${h}')`).join(`, `);
        await connection.query(`
          INSERT INTO hashtags 
            (name)
          VALUES
            ${hashtagNotInserted}
        `);

        const searchCurrentHashtags = currentHashtags.map(h => `name='${h}'`).join(` OR `);
        const searchAllHastags = await connection.query(`
          SELECT 
            *
          FROM hashtags
            WHERE ${searchCurrentHashtags}
        `);

        await connection.query(`
          DELETE FROM "hashtagsPosts"
          WHERE "postId"=$1
        `, [id]);

        const hashtagRelations = searchAllHastags.rows.map(h => `('${h.id}', ${id})`).join(`, `);
        await connection.query(`
          INSERT INTO "hashtagsPosts" 
            ("hashtagId", "postId") 
          VALUES 
            ${hashtagRelations}
        `);
      } else {
        const searchCurrentHashtags = currentHashtags.map(h => `name='${h}'`).join(` OR `);
        const searchAllHastags = await connection.query(`
          SELECT 
            *
          FROM hashtags
            WHERE ${searchCurrentHashtags}
        `);

        await connection.query(`
          DELETE FROM "hashtagsPosts"
          WHERE "postId"=$1
        `, [id]);

        const hashtagRelations = searchAllHastags.rows.map(h => `('${h.id}', ${id})`).join(`, `);
        await connection.query(`
          INSERT INTO "hashtagsPosts" 
            ("hashtagId", "postId") 
          VALUES 
            ${hashtagRelations}
        `);
      }
    } else if (deletedHashtags.length) {
      if (deletedHashtags.length === originalHashtags.length &&
        originalHashtags.length !== 0) {

        await connection.query(`
          DELETE FROM "hashtagsPosts"
          WHERE "postId"=$1
        `, [id]);

        const searchOriginalHashtags = originalHashtags.map(h => `name='${h}'`).join(` OR `);
        const searchAllHastags = await connection.query(`
          SELECT 
            *
          FROM hashtags
            WHERE ${searchOriginalHashtags}
        `);

        const searchUsedHashtagsArr = searchAllHastags.rows.map(h => `"hashtagId"='${h.id}'`).join(` OR `);
        const searchUsedHashtags = await connection.query(`
          SELECT 
            *
          FROM "hashtagsPosts"
          WHERE ${searchUsedHashtagsArr}
        `);

        const hashtagsToBeDeleted = [];
        for (let i = 0; i < searchAllHastags.rows.length; i++) {
          const hashtag = searchAllHastags.rows[i];
          if (!searchUsedHashtags.rows.find(h => h.hashtagId === hashtag.id)) {
            hashtagsToBeDeleted.push(hashtag);
          }
        }

        if (hashtagsToBeDeleted.length) {
          const searchToBeDeleteHashtags = hashtagsToBeDeleted.map(h => `id='${h.id}'`).join(` OR `);
          await connection.query(`
            DELETE FROM hashtags
            WHERE ${searchToBeDeleteHashtags}
          `);
        }
      } else {
        const searchDeletedHashtagsArr = deletedHashtags.map(h => `name='${h}'`).join(` OR `);
        const searchDeletedHashtags = await connection.query(`
          SELECT 
            *
          FROM hashtags
          WHERE ${searchDeletedHashtagsArr}
        `);

        const searchToBeDeleteHashtagsInPost = searchDeletedHashtags.rows.map(h => `"hashtagId"='${h.id}'`).join(` OR `);
        await connection.query(`
          DELETE FROM "hashtagsPosts"
          WHERE "postId"=$1 AND (${searchToBeDeleteHashtagsInPost}) 
        `, [id]);

        const searchUsedHashtagsArr = searchDeletedHashtags.rows.map(h => `"hashtagId"='${h.id}'`).join(` OR `);
        const searchUsedHashtags = await connection.query(`
          SELECT 
            *
          FROM "hashtagsPosts"
          WHERE ${searchUsedHashtagsArr}
        `);

        const hashtagsToBeDeleted = [];
        for (let i = 0; i < searchDeletedHashtags.rows.length; i++) {
          const hashtag = searchDeletedHashtags.rows[i];
          if (!searchUsedHashtags.rows.find(h => h.hashtagId === hashtag.id)) {
            hashtagsToBeDeleted.push(hashtag);
          }
        }

        if (hashtagsToBeDeleted.length) {
          const searchToBeDeleteHashtags = hashtagsToBeDeleted.map(h => `id='${h.id}'`).join(` OR `);
          await connection.query(`
            DELETE FROM hashtags
            WHERE ${searchToBeDeleteHashtags}
          `);
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
  const { id, hashtag } = req.params
  const { user } = res.locals;

  try {
    const posts = await postsService.list(user.id, id, hashtag)
    const { rows: names } = await postsRepository.getNameByLikes()

    const postsWithLikes = posts.map((el, i) => {
      const filteredNames = names.filter(post => post.postId === el.id)

      const likeNames = filteredNames.map(element => element.userName)

      let newArr = { ...el, likeNames }

      return newArr

    })

    if (id) {
      const user = await userRepository.find('id', id)

      if (!user) throw new NotFound("User doesn't exists")

      return res.send({ name: user.name, posts: postsWithLikes })
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