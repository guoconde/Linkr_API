import connection from "../db.js";

export async function find(column, value) {
  const {
    rows: [user],
  } = await connection.query(
    `
        SELECT * 
          FROM users 
         WHERE ${column}=$1
    `,
    [value]
  );

  if (!user) return null;

  return user;
}

export async function findUsersInput(data) {
  const { rows: user } = await connection.query(`
    SELECT name, photo, id FROM users
      WHERE LOWER (users.name) LIKE LOWER($1)
  `, [`${data}%`]);

  return user;
}

export async function unfollow(id) {
  const promise = await connection.query(`
    DELETE FROM followers WHERE id=$1
  `, [id]);
  return promise;
}

export async function follow(followerId, followedId) {
  const promise = await connection.query(`
    INSERT INTO followers ("followerId", "followedId")
      VALUES ($1, $2)
  `, [followerId, followedId]);
  return promise;
}

export async function findRelationOfFollow(followerId, followedId) {
  const query = followedId.map((user, index) => `$${index + 2}`).join(", ");
  const promise = await connection.query(`
    SELECT id, "followedId" FROM followers 
      WHERE "followerId"=$1 AND "followedId" IN (${query})
  `, [followerId, ...followedId]);
  return promise;
}

