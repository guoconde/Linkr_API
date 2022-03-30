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