import { Router } from "express";
import { findUsers, getUserById, register } from "../controllers/userController.js";
import { listPosts } from "../controllers/postsController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const userRouter = Router();
userRouter.post('/sign-up', validateSchemaMiddleware, register);
userRouter.get('/users', findUsers);
userRouter.get('/users/:id', getUserById);
userRouter.get('/user/:id', validateTokenMiddleware, listPosts);
export default userRouter;