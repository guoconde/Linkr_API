import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

export async function validateToken(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  const secretKey = process.env.JWT_SECRET;

  try {
    const data = jwt.verify(token, secretKey);
    res.locals.user = { id: data }
    
  } catch (error) {
    res.status(401).send("Token is invalid");
  }
  next();
}