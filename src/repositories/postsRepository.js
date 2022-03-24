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
    SELECT u.id AS "userId", u.name, u.photo, p.url, p.description FROM hashtagsposts h
      JOIN hashtags hg ON hg.id= h."hashtagId"
      RIGHT JOIN posts p ON p.id = h."postId"
      JOIN users u ON u.id = p."userId"
    GROUP BY p.id, u.id
      ORDER BY p.id DESC
      LIMIT 20
  `)

  return promisse
}

const postsRepository = {
  insert,
  findLatestPost,
  posts
};

export default postsRepository;