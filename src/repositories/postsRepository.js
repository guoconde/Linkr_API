import connection from "../db.js";

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

async function posts(id) {
  const promisse = await connection.query(`
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
      GROUP BY posts.id, users.id, "usersLikes"."isLike", "postsLikes"."postLikes"
      ORDER BY posts.id DESC
      LIMIT 20
  `, [id])

  return promisse
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

async function listByHashtag (hashtag){
  const { rows: posts} = await connection.query(`
    SELECT users.id AS "userId", users.name, users.photo, url, description, "metadataDescription", "metadataImage", "metadataTitle"
        FROM posts
        JOIN "hashtagsPosts" ON "hashtagsPosts"."postId" = posts.id
        JOIN hashtags ON hashtags.id = "hashtagsPosts"."hashtagId"
        JOIN users ON users.id = posts."userId"
        WHERE hashtags.name = $1
        ORDER BY posts.id DESC
        LIMIT 20
        
  `, [`#${hashtag}`])
  
  if (!posts.length) return null;

  return posts;
}

async function listByUser (userId){
  const { rows: posts} = await connection.query(`
      SELECT users.id AS "userId", users.name, users.photo, url, description, "metadataDescription", "metadataImage", "metadataTitle"
        FROM posts
        LEFT JOIN "hashtagsPosts" ON "hashtagsPosts"."postId" = posts.id
        LEFT JOIN hashtags ON hashtags.id = "hashtagsPosts"."hashtagId"
        JOIN users ON users.id = posts."userId"
        WHERE users.id = $1
        ORDER BY posts.id DESC
        LIMIT 20
        
  `, [userId])

  
  if (!posts.length) return [];

  return posts;
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

const postsRepository = {
  insert,
  findLatestPost,
  listByHashtag,
  listByUser,
  findOne,
  deletePost,
  posts,
  getNameByLikes
};

export default postsRepository;