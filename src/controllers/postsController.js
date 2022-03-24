import connection from "../db.js";
import postsRepository from "../repositories/postsRepository.js";
import urlMetadata from "url-metadata";
import { createHashtags, createRelation } from "../services/hashtagsService.js";

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

    res.send(posts);
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
    await postsRepository.findOne(postId);

    if(postExist.rowCount === 0) return res.sendStatus(404);

    if (postExist.rows[0].userId !== user.id) return res.sendStatus(401);

    let hashtagsInPost = await connection.query(`
      SELECT h."hashtagId" FROM posts p
        LEFT JOIN "hashtagsPosts" h ON h."postId"=p.id
      WHERE p.id=$1 AND p."userId"=$2
    `, [postId, user.id]);

    hashtagsInPost = toArrayOfIds(hashtagsInPost.rows);

    if (hashtagsInPost.length > 0){
      const queryArgs = [...hashtagsInPost];
      const comparisonValues = hashtagsInPost.map((id, index) => `$${index +1}`).join(", ");
  
      let hashtagIsInOtherPosts = await connection.query(`
        SELECT "hashtagId" from "hashtagsPosts" 
          WHERE "postId"!=${postId}
            AND "hashtagId" IN (${comparisonValues}) 
      `, queryArgs);

      hashtagIsInOtherPosts = toArrayOfIds(hashtagIsInOtherPosts.rows);

      await connection.query(` DELETE FROM "hashtagsPosts"  WHERE "postId"=$1`, [postId]);
      
      const valuesToDelete = hashtagsInPost.filter(id => !hashtagIsInOtherPosts.includes(id)).join(", ");
      if (valuesToDelete) {
        await connection.query(`DELETE FROM hashtags WHERE id IN ($1)`, [valuesToDelete]);
      }
    }   

    await postsRepository.deletePost(postId);

    res.sendStatus(200);
  } catch (error) {
    console.log(error)
    res.sendStatus(500);
  }
}

function toArrayOfIds(arrayObj) {
  const arrayOfIds = arrayObj.map(obj => {
    const [id] = Object.values(obj)
    return id;
  })
  return arrayOfIds;
}