import connection from "../db.js";

export async function createRepost(userId, postId) {
    const result = await connection.query(`
        INSERT INTO reposts ("userId", "postId") 
            VALUES ($1, $2)
        `, [userId, postId]);

    if (!result.rowCount) return false;

    return true;
}

export  async function deleteRepost(userId, postId) {
    const result = await connection.query(`
        DELETE 
        FROM reposts 
        WHERE "userId" = $1 AND "postId" = $2
        `, [userId, postId]);

    if (!result.rowCount) return false;

    return true;
}

export async function deleteRepostsRelation(postId) {
    const result = await connection.query(`
        DELETE 
        FROM reposts 
        WHERE "postId" = $1
        `, [postId]);

    if (!result.rowCount) return false;

    return true;
}