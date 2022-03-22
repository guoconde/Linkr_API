import connection from "../db.js";

export async function find(column, value){
    const { rows: [user] } = await connection.query(`
        SELECT * 
          FROM users 
         WHERE ${column}=$1
    `, [value])
    
    if (!user) return null;

    return user;
}