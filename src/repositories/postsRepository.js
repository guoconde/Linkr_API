import connection from "../db.js";

async function insert(userId, description, url) {
  const promise = await connection.query(`
    INSERT INTO posts ("userId", description, url) 
      VALUES ($1, $2, $3);
  `, [userId, description, url]);

  return promise;
}

async function findLatestPost(userId) {
  const promise = await connection.query (`
    SELECT * FROM posts WHERE "userId"=$1 ORDER BY id DESC LIMIT 1
  `, [userId]);;

  return promise;
}

async function posts() {
  const promisse = await connection.query(`
  SELECT users.id AS "userId", users.name, users.photo, url, description
    FROM posts
    JOIN "hashtagsPosts" ON "hashtagsPosts"."postId" = posts.id
    JOIN hashtags ON hashtags.id = "hashtagsPosts"."hashtagId"
    JOIN users ON users.id = posts."userId"
    ORDER BY posts.id DESC
    LIMIT 20
  `)

  return promisse
}

async function listByHashtag (hashtag){
  const { rows: posts} = await connection.query(`
      SELECT users.id AS "userId", users.name, users.photo, url, description
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

const postsRepository = {
  insert,
  findLatestPost,
  posts,
  listByHashtag,
};

export default postsRepository;