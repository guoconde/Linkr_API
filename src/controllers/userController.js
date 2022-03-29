import connection from "../db.js";
import bcrypt from 'bcrypt';
import * as usersRepository from "../repositories/userRepository.js"
import BadRequest from "../errors/badRequest.js";

export async function register(req, res) {
  const { username, email, password, picture } = req.body;

  try {
    const searchedUser = await connection.query(`
      SELECT 
        *
      FROM users
      WHERE email=$1
    `, [email]);
    if (searchedUser.rowCount !== 0) {
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
    if (!find) {
      return res.send([]);
    }

    const data = await usersRepository.findUsersInput([find])

    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error")
  }
}

export async function findUser(req, res) {
  const { id } = req.params;
  if(!id){
    res.send(400).send("To get the user, it is necessary to pass through query params the id of the same!");
    return;
  }

  try {
    const searchedUser = await connection.query(`
      SELECT
        u.photo
      FROM users AS u
      WHERE id=$1
    `, [id]);
    if(!searchedUser.rowCount){
      res.send(404).send("Sorry, user not found!");
    }
    
    res.send(searchedUser.rows[0].photo);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}

export async function newFollow(req, res) {
  const { followedId } = req.body;
  const { user } = res.locals;
  
  try {
    if (isNaN(followedId)) throw new BadRequest;

    const isFollowing = await usersRepository.findRelationOfFollow(user.id, followedId);

    if (isFollowing.rowCount > 0){
      const [data] = isFollowing.rows; 
      await usersRepository.unfollow(data.id);
    } else {
      await usersRepository.follow(user.id, followedId);
    }

    return res.sendStatus(200);   
  } catch (error) {
    if(error instanceof BadRequest) res.status(error.status).send(error.message);
    console.log(error);
    res.sendStatus(500);
  }
}