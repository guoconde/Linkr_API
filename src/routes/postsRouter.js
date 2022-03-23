import { Router } from "express";
import { allPosts, createPost } from "../controllers/postsController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const postsRouter = Router();

postsRouter.post("/posts", validateTokenMiddleware, validateSchemaMiddleware, createPost);
postsRouter.get("/posts", allPosts)

export default postsRouter;