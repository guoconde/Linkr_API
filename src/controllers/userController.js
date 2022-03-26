import connection from "../db.js";
import bcrypt from 'bcrypt';
import { findUsersInput } from "../repositories/userRepository.js";


export async function register(req, res) {
  const { username, email, password, picture } = req.body;

  try {
    const searchedUser = await connection.query(`
      SELECT 
        *
      FROM users
      WHERE email=$1
    `, [email]);
    if(searchedUser.rowCount !== 0){
      res.sendStatus(409);
      return;
    }

    const passwordHashed = bcrypt.hashSync(password, 10);

    await connection.query(`
      INSERT INTO users 
        (name, email, password, photo)
      VALUES
        ($1, $2, $3, $4)
    `, [username, email, passwordHashed, picture]);

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function findUsers(req, res) {
  const { find } = req.query

  try {
    const data = await findUsersInput([find])
    
    res.send(data);
} catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error")
}
}