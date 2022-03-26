import connection from "../db.js";

async function list(where, queryArgs) {
  const { rows: posts } = await connection.query(`
      SELECT  users.id AS "userId", users.name, users.photo, 
              posts.id, url, description, "metadataDescription", "metadataImage", "metadataTitle", 
              "usersLikes"."isLike",
              "postsLikes"."postLikes"
      FROM posts
      LEFT JOIN "hashtagsPosts" ON "hashtagsPosts"."postId" = posts.id
      LEFT JOIN hashtags ON hashtags.id = "hashtagsPosts"."hashtagId"
      JOIN users ON users.id = posts."userId"
      LEFT JOIN(
          SELECT *, COUNT(*)
          FROM likes
          WHERE likes."userId" = $1
          GROUP BY "postId", likes.id
      ) AS "usersLikes" ON "usersLikes"."postId" = posts.id
      LEFT JOIN(
          SELECT "postId", COUNT(*) AS "postLikes"
          FROM likes
          GROUP BY "postId"
      ) AS "postsLikes" ON "postsLikes"."postId" = posts.id
      ${where}
      GROUP BY posts.id, users.id, "usersLikes"."isLike", "postsLikes"."postLikes"
      ORDER BY posts.id DESC
      LIMIT 20
  `, queryArgs)
  
  if (!posts.length) return null;

  return posts;
}

async function insert(postData) {
  const queryArgs = Object.values(postData);
  const promise = await connection.query(`
    INSERT INTO posts ("userId", description, url, "metadataDescription", "metadataImage", "metadataTitle") 
      VALUES ($1, $2, $3, $4, $5, $6);
  `, queryArgs);

  return promise;
}

async function findLatestPost(userId) {
  const promise = await connection.query (`
    SELECT * FROM posts WHERE "userId"=$1 ORDER BY id DESC LIMIT 1
  `, [userId]);;

  return promise;
}

async function getNameByLikes() {
  const promise = await connection.query(`
  SELECT "postId", name AS "userName"
  FROM users
  JOIN likes ON likes."userId" = users.id
  GROUP BY "postId", name
  `)

  return promise
}

async function findOne(postId) {
  const promise = await connection.query(`
    SELECT id, "userId" FROM posts WHERE id=$1
  `, [postId]);
  
  return promise;
}

async function deletePost(postId) {
  const promise = await connection.query(`DELETE FROM posts WHERE id=$1`, [postId]);
  return promise;
}

async function insertLike(postId, userId, isLiked) {

  const promise = await connection.query(`
      INSERT INTO likes
          ("userId", "postId", "isLike") VALUES ($1, $2, $3)
  `, [userId, postId, isLiked])

  return promise
}

async function deleteLike(postId, userId, isLiked) {
  
  const promise = await connection.query(`
      DELETE FROM likes 
          WHERE "postId" = $1 AND "userId" = $2
      `, [postId, userId]);

  return promise;
}

const postsRepository = {
  list,
  insert,
  findLatestPost,
  findOne,
  deletePost,
  getNameByLikes,
  insertLike,
  deleteLike
};

export default postsRepository;