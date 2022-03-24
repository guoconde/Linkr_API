import connection from "../db.js";

export async function getHashtags(_req, res) {
  try {
    const hashtags = await connection.query(`
      SELECT 
        h.*,
        hp."hashtagId" AS "hashtagId",
        COUNT(hp."hashtagId") AS "hashtagCount"
      FROM hashtags AS h
        JOIN hashtagsposts AS hp ON hp."hashtagId"=h.id
      GROUP BY hp."hashtagId", h.id
      ORDER BY "hashtagCount" DESC
      LIMIT 10
    `);

    res.status(200).send(hashtags.rows);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);    
  }  
}