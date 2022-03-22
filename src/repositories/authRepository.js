import connection from "../db.js";

export async function insert (token, id){
    const result = await connection.query(`
        INSERT INTO sessions (token, "userId") 
             VALUES ($1, $2)
    `, [token, id])
    
    if (!result.rowCount) return false;

    return true;
}