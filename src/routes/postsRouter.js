import { Router } from "express";
import { allPosts, createPost, deletePost } from "../controllers/postsController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const postsRouter = Router();

postsRouter.get("/posts", allPosts);
postsRouter.post("/posts", validateTokenMiddleware, validateSchemaMiddleware, createPost);
postsRouter.delete("/posts/:id", validateTokenMiddleware, deletePost);

export default postsRouter;