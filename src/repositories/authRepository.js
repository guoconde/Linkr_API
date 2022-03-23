import connection from "../db.js";

export async function insert (token, userId){
    const result = await connection.query(`
        INSERT INTO sessions (token, "userId") 
             VALUES ($1, $2)
    `, [token, userId])
    
    if (!result.rowCount) return false;

    return true;
}

export async function find (userId){
    const { rows: [token] } = await connection.query(`
        SELECT * 
          FROM sessions 
         WHERE sessions."userId"=$1
    `, [userId])
    
    if (!token) return null;

    return token;
}

export async function remove (sesionId){
    const result = await connection.query(`
        DELETE FROM sessions WHERE id=$1
    `, [sesionId]);

    if (!result.rowCount) return false;

    return true;
}