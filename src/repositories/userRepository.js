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

export async function insert(username, email, passwordHashed, picture){
  const result = await connection.query(`
      INSERT INTO users 
        (name, email, password, photo)
      VALUES
        ($1, $2, $3, $4)
  `, [username, email, passwordHashed, picture]);

  if(result.rowCount === 0) return false

  return true
}

export async function findUsersInput(data) {
  const { rows: users } = await connection.query(`
    SELECT name, photo, id FROM users
      WHERE LOWER (users.name) LIKE LOWER($1)
  `, [`${data}%`]);

  return users;
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

export async function findFollowed(userId) {
  const isFollowingSomeone = await connection.query(`SELECT id FROM followers WHERE "followerId"=$1`, [userId]);

  if (isFollowingSomeone.rowCount > 0) {
    return true;
  } else {
    return false;
  }
}
