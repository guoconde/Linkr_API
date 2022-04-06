import connection from "../db.js";

export async function createGeolocation(userId, postId, latitude, longitude) {
  const promise = await connection.query(`
    INSERT INTO geolocation 
      ("userId", "postId", "latitude", "longitude")
    VALUES
      ($1, $2, $3, $4)
  `, [userId, postId, latitude, longitude]);

  return promise;
}

export async function deleteGeolocation(postId) {
  const promise = await connection.query(`
    DELETE FROM geolocation 
    WHERE "postId"=$1
  `, [postId]);

  return promise;
}