import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import connection from '../db.js';
dotenv.config();

export default async function validateTokenMiddleware(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  const secretKey = process.env.JWT_SECRET;
  if(!token){
    res.sendStatus(401).send("Token is invalid");;
    return;
  }

  try {
    const session = await connection.query(`
      SELECT * FROM sessions WHERE token=$1
    `, [token]);
    if(!session.rowCount){
      res.status(401).send("Session is invalid");
      return;
    }

    try {
      const data = jwt.verify(token, secretKey);
      
      res.locals.user = { id: data }
      
      next();
    } catch (error) {
      console.log(error);
      res.status(401).send("Token is invalid");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}