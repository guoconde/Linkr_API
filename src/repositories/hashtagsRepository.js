import connection from "../db.js";

async function insert(values) {
  return await connection.query(`INSERT INTO hashtags (name) VALUES ${values}`);
}

async function find(params, hashtags) {
  const result = await connection.query(`
    SELECT * from hashtags WHERE name IN (${params})
  `, hashtags);
  return result;
}

export const hashtagsRepository = {
  insert,
  find
};
