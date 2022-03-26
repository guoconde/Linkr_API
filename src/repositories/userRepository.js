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

export async function findUsersInput(data) {
    
    const { rows: user } = await connection.query(`
        SELECT name, photo, id
            FROM users
            WHERE LOWER(users.name) LIKE LOWER($1)
    `, [`%${data}%`])

    return user
}