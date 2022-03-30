import connection from "../db.js";

async function list(where, queryArgs) {
  const { rows: posts } = await connection.query(`
    SELECT  users.id AS "userId", users.name, users.photo,
            posts.id, url, description, "metadataDescription", "metadataImage", "metadataTitle",
            COALESCE("userLikes"."isLike", false) AS "isLike",
            COALESCE("postsLiked"."postLikes", 0) AS "postLikes",
            COALESCE("postsReposted"."reposts", 0) AS "reposts",
            "userReposts"."postId" AS reposted,
            reposts.date, "repostsUser"."repostedBy",
            COALESCE("postsCommented"."commentsCount", 0) AS "commentsCount"
    FROM reposts 
      LEFT JOIN posts ON posts.id = reposts."postId"
      LEFT JOIN users ON users.id = posts."userId"
    LEFT JOIN(
        SELECT "postId", "isLike"
        FROM likes
        WHERE likes."userId" = $1
        GROUP BY "postId", likes.id
    ) AS "userLikes" ON "userLikes"."postId" = posts.id
    LEFT JOIN(
        SELECT "postId", COUNT(*) AS "postLikes"
        FROM likes
        GROUP BY "postId"
    ) AS "postsLiked" ON "postsLiked"."postId" = posts.id
    JOIN(
      SELECT "postId", COUNT(*) AS "reposts"
      FROM reposts
      GROUP BY "postId"
    ) AS "postsReposted" ON "postsReposted"."postId" = posts.id
    LEFT JOIN(
      SELECT "postId", COUNT(*) AS "commentsCount"
      FROM comments
      GROUP BY "postId"
    ) AS "postsCommented" ON "postsCommented"."postId" = posts.id
    LEFT JOIN(
      SELECT "postId"
      FROM reposts
      WHERE reposts."userId" = $1
      GROUP BY "postId", reposts.id
    ) AS "userReposts" ON "userReposts"."postId" = posts.id
    JOIN(
      SELECT users.name AS "repostedBy", reposts.id
      FROM reposts
      JOIN users ON users.id = reposts."userId"
    ) AS "repostsUser" ON "repostsUser".id = reposts.id
    UNION ALL 
    SELECT  users.id AS "userId", users.name, users.photo, 
          posts.id, url, description, "metadataDescription", "metadataImage", "metadataTitle",
          COALESCE("userLikes"."isLike", false) AS "isLike",
          COALESCE("postsLiked"."postLikes", 0) AS "postLikes",
          COALESCE("postsReposted"."reposts", 0) AS "reposts",
          "userReposts"."postId" AS reposted,
          date , NULL,
          COALESCE("postsCommented"."commentsCount", 0) AS "commentsCount"
    FROM posts
    JOIN users ON users.id = posts."userId"
    LEFT JOIN(
        SELECT *, COUNT(*)
        FROM likes
        WHERE likes."userId" = $1
        GROUP BY "postId", likes.id
    ) AS "userLikes" ON "userLikes"."postId" = posts.id
    LEFT JOIN(
        SELECT "postId", COUNT(*) AS "postLikes"
        FROM likes
        GROUP BY "postId"
    ) AS "postsLiked" ON "postsLiked"."postId" = posts.id
    LEFT JOIN(
      SELECT "postId", COUNT(*) AS "reposts"
      FROM reposts
      GROUP BY "postId"
    ) AS "postsReposted" ON "postsReposted"."postId" = posts.id
    LEFT JOIN(
      SELECT "postId", COUNT(*) AS "commentsCount"
      FROM comments
      GROUP BY "postId"
    ) AS "postsCommented" ON "postsCommented"."postId" = posts.id
    LEFT JOIN(
      SELECT "postId"
      FROM reposts
      WHERE reposts."userId" = $1
      GROUP BY "postId", reposts.id
    ) AS "userReposts" ON "userReposts"."postId" = posts.id
    ${where}
    ORDER BY date DESC
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
  const promise = await connection.query(`
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

async function deleteComments(postId) {
  const promise = await connection.query(`DELETE FROM comments WHERE id=$1`, [postId]);
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
  deleteComments,
  getNameByLikes,
  insertLike,
  deleteLike
};

export default postsRepository;