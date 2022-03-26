import { Router } from "express";
import { findUsers, register } from "../controllers/userController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";

const userRouter = Router();
userRouter.post('/sign-up', validateSchemaMiddleware, register);
userRouter.get('/users', findUsers)
export default userRouter;