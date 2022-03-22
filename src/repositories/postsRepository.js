async function insert(userId, description, url) {
  const promise = await connection.query(`
    INSERT INTO posts ("userId", description, url) 
      VALUE ($1, $2, $3);
  `, [userId, description, url]);

  return promise;
}

async function find(userId) {
  const promise = await connection.query (`
    SELECT * FROM posts WHERE "userId"=$1 ORDER BY DESC LIMIT 1
  `, [userId]);;

  return promise;
}

const postsRepository = {
  insert,
  find
};

export default postsRepository;