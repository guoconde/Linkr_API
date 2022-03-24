import connection from "../db.js";
import toArrayOfIds from "../utils/toArrayOfIds.js";

async function insert(values) {
  return await connection.query(`INSERT INTO hashtags (name) VALUES ${values}`);
}

async function find(params, hashtags) {
  const result = await connection.query(`
    SELECT * from hashtags WHERE name IN (${params})
  `, hashtags);
  return result;
}

async function findHashtagsInPost(postId, userId) {
  let hashtagsInPost = await connection.query(`
    SELECT h."hashtagId" FROM posts p
      JOIN "hashtagsPosts" h ON h."postId"=p.id
    WHERE p.id=$1 AND p."userId"=$2
  `, [postId, userId]);

  hashtagsInPost = toArrayOfIds(hashtagsInPost.rows);
  return hashtagsInPost;
}

async function findHashtagInOtherPosts (hashtagsInPost, postId) {
  const queryArgs = [...hashtagsInPost];
  const comparisonValues = hashtagsInPost.map((id, index) => `$${index +1}`).join(", ");
  let hashtagIsInOtherPosts = await connection.query(`
    SELECT "hashtagId" from "hashtagsPosts" 
      WHERE "postId"!=${postId}
        AND "hashtagId" IN (${comparisonValues}) 
  `, queryArgs);

  hashtagIsInOtherPosts = toArrayOfIds(hashtagIsInOtherPosts.rows);
   
  return hashtagIsInOtherPosts;
}

async function deleteMany(hashtagIsInOtherPosts, hashtagsInPost) {
  const valuesToDelete = hashtagsInPost.filter(id => !hashtagIsInOtherPosts.includes(id));
  const params = valuesToDelete.map((v, index) => `$${index + 1}`).join(", ");
  if (valuesToDelete.length > 0) {
    await connection.query(`DELETE FROM hashtags WHERE id IN (${params})`, valuesToDelete);
  }
  return "";
}

export const hashtagsRepository = {
  insert,
  find, 
  findHashtagsInPost,
  findHashtagInOtherPosts,
  deleteMany
};
