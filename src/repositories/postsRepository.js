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

async function posts() {
  const promisse = await connection.query(`
    SELECT u.id AS "userId", u.name, u.photo, p.url, p.description, p."metadataDescription",
      p."metadataImage", p."metadataTitle"
    FROM "hashtagsPosts" h
      JOIN hashtags hg ON hg.id= h."hashtagId"
      RIGHT JOIN posts p ON p.id = h."postId"
      JOIN users u ON u.id = p."userId"
    GROUP BY p.id, u.id
      ORDER BY p.id DESC
      LIMIT 20
  `)

  return promisse
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
  findOne,
  posts,
  deletePost,
  posts
};

export default postsRepository;