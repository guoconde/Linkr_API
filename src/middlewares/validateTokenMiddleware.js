import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import connection from '../db.js'
import * as authRepository from "../repositories/authRepository.js"
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
    const { rows: [session]} = await connection.query(`
      SELECT * FROM sessions WHERE token=$1
    `, [token]);
    if(!session) return res.status(401).send("Session is invalid");

    try {
      const decoded = jwt.verify(token, secretKey)
      res.locals.user = { id: decoded.userId }
    } catch (error) {
      await authRepository.remove(session.id)
      return res.status(401).send("Token expired, please log in again")
    }
    
      
    next();
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}