import connection from "../db.js";

export async function insert (token, id){
    const result = await connection.query(`
        INSERT INTO sessions (token, "userId") 
             VALUES ($1, $2)
    `, [token, id])
    
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