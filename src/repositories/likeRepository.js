import connection from "../db.js";

export async function deleteLikesRelation(postId) {
  const promise = await connection.query(`
    DELETE FROM likes WHERE "postId"=$1
  `, [postId]);

  return promise;
}

export async function insertLike(postId, userId, isLiked) {

  const promise = await connection.query(`
      INSERT INTO likes
        ("userId", "postId", "isLike") 
      VALUES 
        ($1, $2, $3)
  `, [userId, postId, isLiked])

  return promise;
}

export async function deleteLike(postId, userId) {
  const promise = await connection.query(`
    DELETE FROM likes 
    WHERE "postId" = $1 AND "userId" = $2
  `, [postId, userId]);

  return promise;
}

export async function getNameByLikes() {
  const promise = await connection.query(`
    SELECT 
      "postId", name AS "userName"
    FROM users
      JOIN likes ON likes."userId" = users.id
    GROUP BY "postId", name
  `)

  return promise;
}