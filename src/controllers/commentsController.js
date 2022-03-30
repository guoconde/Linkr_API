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
  if (!postId) {
    res.status(404).send("Post not found!");
  }

  try {
    const comments = await connection.query(`
      SELECT 
        c.id,
        u.name, u.photo,
        c.comment
      FROM comments AS c
        JOIN users AS u ON u.id=c."userId"
      WHERE c."postId"=$1
      ORDER BY c.id
    `, [postId]);

    res.send(comments.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}