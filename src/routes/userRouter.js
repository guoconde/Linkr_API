import { Router } from "express";
import { register } from "../controllers/userController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";

const userRouter = Router();
userRouter.post('/sign-up', validateSchemaMiddleware, register);
export default userRouter;