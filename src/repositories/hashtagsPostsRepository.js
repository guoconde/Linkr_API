import connection from "../db.js";

async function insert(values) {
  return await connection.query(`
    INSERT INTO "hashtagsPosts" ("userId", "postId") 
      VALUES ${values}
  `);
}

export const hashtagsPostsRepository = {
  insert
};