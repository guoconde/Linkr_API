import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import connection from '../db.js'
import * as sessionRepository from "../repositories/sessionRepository.js"
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
    const session = await sessionRepository.find('"token"', token)
    if(!session) return res.status(401).send("Session is invalid");

    try {
      const decoded = jwt.verify(token, secretKey)
      res.locals.user = { id: decoded.userId }
    } catch (error) {
      await sessionRepository.remove(session.id)
      return res.status(401).send("Token expired, please log in again")
    }
    
      
    next();
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}