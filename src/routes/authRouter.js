import { Router } from "express";
import { login } from "../controllers/authController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";

const authRouter = Router();
authRouter.post('/login', validateSchemaMiddleware, login);
export default authRouter;