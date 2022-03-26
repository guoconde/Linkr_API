import { Router } from "express";
import { listPosts } from "../controllers/postsController.js";
import { register } from "../controllers/userController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const userRouter = Router();
userRouter.post('/sign-up', validateSchemaMiddleware, register);
userRouter.get('/user/:id', validateTokenMiddleware, listPosts);
export default userRouter;