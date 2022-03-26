import postsRepository from "../repositories/postsRepository.js";
import urlMetadata from "url-metadata";
import { createHashtags, createRelation } from "../services/hashtagsService.js";
import postsService from "../services/postsService.js";

import { findHashtags } from "../utils/findHashtags.js";
import NotFound from "../errors/NotFoundError.js";
import Unauthorized from "../errors/UnauthorizedError.js";
import connection from "../db.js";

import { hashtagsPostsRepository } from "../repositories/hashtagsPostsRepository.js";

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

export async function allPosts(req, res) {

  const { user } = res.locals;

  try {
    const { rows } = await postsRepository.posts(user.id)
    const { rows: names } = await postsRepository.getNameByLikes()

    const posts = rows.map((el, i) => {
      const filteredNames = names.filter(post => post.postId === el.id)

      const likeNames = filteredNames.map(element => element.userName )

      let newArr = {...el, likeNames}

      return newArr

    })

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
  console.log("postId: ", id);

  try {
    await connection.query(`
      UPDATE posts 
        SET description=$1 
      WHERE id=$2 AND "userId"=$3
    `, [post.description, id, user.id]);

    /* Comparar pelo conteúdo da array: */
    const originalHashtags = findHashtags(post.originalDescription);
    const currentHashtags = findHashtags(post.description);

    console.log("originalHashtags: ", originalHashtags);
    console.log("currentHashtags: ", currentHashtags);

    const newHashtags = [];
    for (let i = 0; i < currentHashtags.length; i++) {
      const hashtag = currentHashtags[i];
      if (originalHashtags.indexOf(hashtag) === -1) {
        newHashtags.push(hashtag);
      }
    }

    console.log("newHashtags: ", newHashtags);

    const deletedHashtags = [];
    if (!newHashtags.length && originalHashtags.length > currentHashtags.length) {
      for (let i = 0; i < originalHashtags.length; i++) {
        const hashtag = originalHashtags[i];
        if (currentHashtags.indexOf(hashtag) === -1) {
          deletedHashtags.push(hashtag);
        }
      }
    }

    console.log("deletedHashtags: ", deletedHashtags);
    console.log("deletedHashtagsAll: ", deletedHashtags.length === originalHashtags.length);

    if (newHashtags.length) {
      console.log("EDIÇÃO - INSERIR NOVAS HASHTAGS");

      const searchNewHashtags = newHashtags.map(h => `name='${h}'`).join(` OR `);
      console.log("searchNewHashtags: ", searchNewHashtags);

      const seachedHastags = await connection.query(`
        SELECT 
          *
        FROM hashtags
          WHERE ${searchNewHashtags}
      `);
      console.log("seachedHastags: ", seachedHastags.rows);

      const newHashtagsNotInserted = [];
      for (let i = 0; i < newHashtags.length; i++) {
        const hashtag = newHashtags[i];
        if (!seachedHastags.rows.find(h => h.name === hashtag)) {
          newHashtagsNotInserted.push(hashtag);
        }
      }
      console.log("newHashtagsNotInserted: ", newHashtagsNotInserted);

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
        console.log("seachAllHastags (if): ", searchAllHastags.rows);

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
        console.log("seachAllHastags (else): ", searchAllHastags.rows);

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
      console.log("EDIÇÃO - REMOVER HASHTAGS EXISTENTES NA DESCRIÇÃO");
      if (deletedHashtags.length === originalHashtags.length &&
        originalHashtags.length !== 0) {
        console.log("VERIFICAÇÂO - Nenhuma hashtag no post");

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
        console.log("searchAllHastags: ", searchAllHastags.rows);

        const searchUsedHashtagsArr = searchAllHastags.rows.map(h => `"hashtagId"='${h.id}'`).join(` OR `);
        const searchUsedHashtags = await connection.query(`
          SELECT 
            *
          FROM "hashtagsPosts"
          WHERE ${searchUsedHashtagsArr}
        `);
        console.log("searchUsedHashtags: ", searchUsedHashtags.rows);

        const hashtagsToBeDeleted = [];
        for (let i = 0; i < searchAllHastags.rows.length; i++) {
          const hashtag = searchAllHastags.rows[i];
          if (!searchUsedHashtags.rows.find(h => h.hashtagId === hashtag.id)) {
            hashtagsToBeDeleted.push(hashtag);
          }
        }
        console.log("hashtagsToBeDeleted: ", hashtagsToBeDeleted);

        if(hashtagsToBeDeleted.length){
          const searchToBeDeleteHashtags = hashtagsToBeDeleted.map(h => `id='${h.id}'`).join(` OR `);
          await connection.query(`
            DELETE FROM hashtags
            WHERE ${searchToBeDeleteHashtags}
          `);
        }
      } else {
        console.log("VERIFICAÇÃO - Quantidade hashtags difernte de 0");

        const searchDeletedHashtagsArr = deletedHashtags.map(h => `name='${h}'`).join(` OR `);
        const searchDeletedHashtags = await connection.query(`
          SELECT 
            *
          FROM hashtags
          WHERE ${searchDeletedHashtagsArr}
        `);
        console.log("searchDeletedHashtags: ", searchDeletedHashtags.rows);

        const searchToBeDeleteHashtagsInPost = searchDeletedHashtags.rows.map(h => `"hashtagId"='${h.id}'`).join(` OR `);
        console.log("searchToBeDeleteHashtagsInPost: ", searchToBeDeleteHashtagsInPost);
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
        console.log("searchUsedHashtags: ", searchUsedHashtags.rows);

        const hashtagsToBeDeleted = [];
        for (let i = 0; i < searchDeletedHashtags.rows.length; i++) {
          const hashtag = searchDeletedHashtags.rows[i];
          if (!searchUsedHashtags.rows.find(h => h.hashtagId === hashtag.id)) {
            hashtagsToBeDeleted.push(hashtag);
          }
        }
        console.log("hashtagsToBeDeleted: ", hashtagsToBeDeleted);

        if(hashtagsToBeDeleted.length){
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
    res.sendStatus(500);
  }
}