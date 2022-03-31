import connection from "../db.js";

export async function insert (token, userId){
    const result = await connection.query(`
        INSERT INTO sessions (token, "userId") 
             VALUES ($1, $2)
    `, [token, userId])
    
    if (!result.rowCount) return false;

    return true;
}

export async function find (column, value){
    const { rows: [session] } = await connection.query(`
        SELECT * 
          FROM sessions 
         WHERE ${column}=$1
    `, [value])

    if (!session) return null;

    return session;
}

export async function remove (sesionId){
    const result = await connection.query(`
        DELETE FROM sessions WHERE id=$1
    `, [sesionId]);

    if (!result.rowCount) return false;

    return true;
}