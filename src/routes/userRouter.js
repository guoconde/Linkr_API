import { Router } from "express";
import { findUsers, newFollow, register } from "../controllers/userController.js";
import { listPosts } from "../controllers/postsController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const userRouter = Router();
userRouter.post('/sign-up', validateSchemaMiddleware, register);
userRouter.get('/users', validateTokenMiddleware, findUsers);
userRouter.get('/user/:id', validateTokenMiddleware, listPosts);
userRouter.post("/users/follow", validateTokenMiddleware, newFollow);
export default userRouter;