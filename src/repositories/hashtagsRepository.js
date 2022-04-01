import connection from "../db.js";
import toArrayOfIds from "../utils/toArrayOfIds.js";

export async function specificsHashtags(values) {
  const promise = await connection.query(`
    SELECT 
      *
    FROM hashtags
    WHERE ${values}
  `);

  return promise;
}

export async function specificsHashtagsRelation(values) {
  const promise = await connection.query(`
    SELECT 
      *
    FROM "hashtagsPosts"
    WHERE ${values}
  `);

  return promise;
}

export async function insert(values) {
  return await connection.query(`
    INSERT INTO hashtags 
      (name) 
    VALUES 
      ${values}
  `);
}

export async function find(params, hashtags) {
  const result = await connection.query(`
    SELECT 
      * 
    FROM hashtags 
    WHERE name IN (${params})
  `, hashtags);

  return result;
}

export async function findHashtagsInPost(postId, userId) {
  let hashtagsInPost = await connection.query(`
    SELECT 
      h."hashtagId" 
    FROM posts p
      JOIN "hashtagsPosts" h ON h."postId"=p.id
    WHERE p.id=$1 AND p."userId"=$2
  `, [postId, userId]);

  hashtagsInPost = toArrayOfIds(hashtagsInPost.rows);
  return hashtagsInPost;
}

export async function findHashtagInOtherPosts(hashtagsInPost, postId) {
  const queryArgs = [...hashtagsInPost];
  const comparisonValues = hashtagsInPost.map((id, index) => `$${index + 1}`).join(", ");
  let hashtagIsInOtherPosts = await connection.query(`
    SELECT 
      "hashtagId" 
    FROM "hashtagsPosts" 
    WHERE "postId"!=${postId} AND "hashtagId" IN (${comparisonValues}) 
  `, queryArgs);

  hashtagIsInOtherPosts = toArrayOfIds(hashtagIsInOtherPosts.rows);
  return hashtagIsInOtherPosts;
}

export async function deleteMany(hashtagIsInOtherPosts, hashtagsInPost) {
  const valuesToDelete = hashtagsInPost.filter(id => !hashtagIsInOtherPosts.includes(id));
  const params = valuesToDelete.map((v, index) => `$${index + 1}`).join(", ");
  if (valuesToDelete.length > 0) {
    await connection.query(`DELETE FROM hashtags WHERE id IN (${params})`, valuesToDelete);
  }

  return "";
}

export async function insertHashtagsRelation(values) {
  return await connection.query(`
    INSERT INTO "hashtagsPosts" 
      ("hashtagId", "postId") 
    VALUES 
      ${values}
  `);
}

export async function listHashtags() {
  return await connection.query(`
    SELECT 
      h.*,
      hp."hashtagId" AS "hashtagId",
      COUNT(hp."hashtagId") AS "hashtagCount"
    FROM hashtags AS h
      JOIN "hashtagsPosts" AS hp ON hp."hashtagId"=h.id
    GROUP BY hp."hashtagId", h.id
    ORDER BY "hashtagCount" DESC
    LIMIT 10
  `);
}

export async function deleteSpecificsHashtags(values) {
  const promise = await connection.query(` 
    DELETE FROM hashtags
    WHERE ${values}
  `);

  return promise;
}

export async function deleteHashtagsRelation(postId) {
  const promise = await connection.query(` 
    DELETE FROM "hashtagsPosts" 
    WHERE "postId"=$1
  `, [postId]);

  return promise;
}

export async function deleteHashtagsRelationInPost(postId, values) {
  const promise = await connection.query(` 
    DELETE FROM "hashtagsPosts"
    WHERE "postId"=$1 AND (${values})
  `, [postId]);

  return promise;
}