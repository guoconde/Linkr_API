import connection from "../db.js";

export async function deleteComments(postId) {
  const promise = await connection.query(`DELETE FROM comments WHERE "postId"=$1`, [postId]);
  
  return promise;
}