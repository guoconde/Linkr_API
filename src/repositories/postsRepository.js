import connection from "../db.js";

export async function list(where, queryArgs, hashtagRelation, repostsWhere, limit) {
  const { rows: posts } = await connection.query(`
    SELECT 	users.id AS "userId", users.name, users.photo,
            posts.id, url, description, "metadataDescription", "metadataImage", "metadataTitle",
            COALESCE("userLikes"."isLike", false) AS "isLike",
            COALESCE("postsLiked"."postLikes", 0) AS "postLikes",
            COALESCE("postsReposted"."reposts", 0) AS "reposts",
            "userReposts"."postId" AS reposted,
            reposts.date, "sharerName", "sharerId",
            COALESCE("postsCommented"."commentsCount", 0) AS "commentsCount",
            "postsGeolocated".latitude AS latitude, "postsGeolocated".longitude AS longitude
    FROM 	reposts 
    JOIN posts ON posts.id = reposts."postId"
    ${hashtagRelation}
    JOIN users ON users.id = posts."userId"
    LEFT JOIN(
      SELECT "postId", "isLike"
      FROM likes
      WHERE likes."userId" = $1
      GROUP BY "postId", likes.id
    ) AS "userLikes" ON "userLikes"."postId" = posts.id
    LEFT JOIN(
      SELECT "postId"
      FROM reposts
      WHERE reposts."userId" = $1
      GROUP BY "postId", reposts.id
    ) AS "userReposts" ON "userReposts"."postId" = posts.id
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
      SELECT "postId", "latitude", "longitude"
      FROM geolocation
      GROUP BY "postId", "latitude", "longitude"
    ) AS "postsGeolocated" ON "postsGeolocated"."postId" = posts.id
    JOIN(
      SELECT users.name AS "sharerName", users.id AS "sharerId", reposts.id
      FROM reposts
      JOIN users ON users.id = reposts."userId"
    ) AS "repostsUser" ON "repostsUser".id = reposts.id
    ${repostsWhere}
    UNION ALL 
    SELECT  users.id AS "userId", users.name, users.photo, 
            posts.id, url, description, "metadataDescription", "metadataImage", "metadataTitle",
            COALESCE("userLikes"."isLike", false) AS "isLike",
            COALESCE("postsLiked"."postLikes", 0) AS "postLikes",
            COALESCE("postsReposted"."reposts", 0) AS "reposts",
            "userReposts"."postId" AS reposted,
            date , NULL AS "sharerName", NULL AS "sharerId",
            COALESCE("postsCommented"."commentsCount", 0) AS "commentsCount",
            "postsGeolocated".latitude AS latitude, "postsGeolocated".longitude AS longitude
    FROM posts
    ${hashtagRelation}
    JOIN users ON users.id = posts."userId"
    LEFT JOIN(
      SELECT *, COUNT(*)
      FROM likes
      WHERE likes."userId" = $1
      GROUP BY "postId", likes.id
    ) AS "userLikes" ON "userLikes"."postId" = posts.id
    LEFT JOIN(
      SELECT "postId"
      FROM reposts
      WHERE reposts."userId" = $1
      GROUP BY "postId", reposts.id
    ) AS "userReposts" ON "userReposts"."postId" = posts.id
    LEFT JOIN(
      SELECT "postId", COUNT(*) AS "postLikes"
      FROM likes
      GROUP BY "postId"
    ) AS "postsLiked" ON "postsLiked"."postId" = posts.id
    LEFT JOIN(
      SELECT "postId", COUNT(*) AS "commentsCount"
      FROM comments
      GROUP BY "postId"
    ) AS "postsCommented" ON "postsCommented"."postId" = posts.id
    LEFT JOIN(
      SELECT "postId", "latitude", "longitude"
      FROM geolocation
      GROUP BY "postId", "latitude", "longitude"
    ) AS "postsGeolocated" ON "postsGeolocated"."postId" = posts.id
    LEFT JOIN(
      SELECT "postId", COUNT(*) AS "reposts"
      FROM reposts
      GROUP BY "postId"
    ) AS "postsReposted" ON "postsReposted"."postId" = posts.id
    ${where}
    ORDER BY date DESC
    LIMIT ${limit}
  `, queryArgs);

  if (!posts.length) return [];

  return posts;
}

export async function insert(postData) {
  const queryName = Object.keys(postData).map(k => `"${k}"`).join(", ")
  const queryArgs = Object.values(postData);
  const queryParams = queryArgs.map( (key, index) => `$${index + 1}`).join(", ");

  const promise = await connection.query(`
    INSERT INTO posts 
      (${queryName}) 
    VALUES 
      (${queryParams})
  `, queryArgs);

  return promise;
}

export async function findLatestPost(userId) {
  const promise = await connection.query(`
    SELECT 
      * 
    FROM posts 
    WHERE "userId"=$1 
    ORDER BY id DESC 
    LIMIT 1
  `, [userId]);

  return promise;
}

export async function findOne(postId) {
  const promise = await connection.query(`
    SELECT 
      id, "userId" 
    FROM posts 
    WHERE id=$1
  `, [postId]);

  return promise;
}

export async function deletePost(postId) {
  const promise = await connection.query(`
    DELETE FROM posts 
    WHERE id=$1
  `, [postId]);
  
  return promise;
}

export async function updatePostDescription(description, postId, userId) {
  const promise = await connection.query(`
    UPDATE posts 
      SET description=$1 
    WHERE id=$2 AND "userId"=$3
  `, [description, postId, userId]);

  return promise;
}

export async function getCountPosts(userId) {
  const promise = await connection.query(`
    SELECT 
      COUNT(id) 
    FROM posts
    WHERE posts."userId" 
    IN (SELECT "followedId" FROM followers WHERE "followerId"=$1)
  UNION ALL 
    SELECT 
      COUNT(id) 
    FROM reposts
    WHERE reposts."userId" 
    IN (SELECT "followedId" FROM followers WHERE "followerId"=$1)
  `, [userId]);

  return promise;
}

export async function lastPost(userId) {
  const promise = await connection.query(`
    SELECT 
      * 
    FROM posts 
    WHERE "userId"=$1 
    ORDER BY id DESC 
    LIMIT 1
  `, [userId]);

  return promise;
}