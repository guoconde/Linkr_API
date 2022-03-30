import connection from "../db.js";

export async function createComment(req, res) {
  const { userId, postId, comment } = req.body;

  try {
    await connection.query(`
      INSERT INTO comments
        ("userId", "postId", comment)
      VALUES
        ($1, $2, $3)
    `, [userId, postId, comment]);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}

export async function listComments(req, res) {
  const { postId } = req.params;
  const { id } = res.locals.user;
  if (!postId) {
    res.status(404).send("Post not found!");
  }

  try {
    const comments = await connection.query(`
      SELECT 
        c.id,
        c."userId" AS "userId",
        p."userId" AS "authorId",
        f."followedId",
        u.name, u.photo,
        c.comment
      FROM posts AS p
        JOIN comments AS c ON c."postId"=p."id"
        JOIN users AS u ON u.id=c."userId"
        LEFT JOIN followers AS f ON f."followerId"=$1 AND f."followedId"=c."userId"
      WHERE c."postId"=$2
      ORDER BY c.id
    `, [id, postId]);
    
    res.send(comments.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}