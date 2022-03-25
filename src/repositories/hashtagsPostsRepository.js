import connection from "../db.js";

async function insert(values) {
  return await connection.query(`
    INSERT INTO "hashtagsPosts" ("hashtagId", "postId") 
      VALUES ${values}
  `);
}

async function deleteRelation(postId) {
  const promise = await connection.query(` 
    DELETE FROM "hashtagsPosts" WHERE "postId"=$1
  `, [postId]);
  return promise;
}

export const hashtagsPostsRepository = {
  insert,
  deleteRelation
};