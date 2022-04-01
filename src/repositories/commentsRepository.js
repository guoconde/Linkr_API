import connection from "../db.js";

export async function deleteComments(postId) {
  const promise = await connection.query(`
    DELETE FROM comments 
    WHERE "postId"=$1
  `, [postId]);

  return promise;
}

export async function insertComment(userId, postId, comment) {
  const promise = await connection.query(`
    INSERT INTO comments
      ("userId", "postId", comment)
    VALUES
      ($1, $2, $3)
  `, [userId, postId, comment]);

  return promise;
}

export async function listComments(id, postId) {
  const promise = await connection.query(`
    SELECT 
      c.id,
      c."userId" AS "userId",
      p."userId" AS "authorId",
      f."followedId",
      u.name, u.photo,
      c.comment
    FROM posts AS p
      JOIN comments AS c ON c."postId"=p."id"
      JOIN users AS u ON u.id=c."userId"
      LEFT JOIN followers AS f ON f."followerId"=$1 AND f."followedId"=c."userId"
    WHERE c."postId"=$2
    ORDER BY c.id
  `, [id, postId]);

  return promise;  
}