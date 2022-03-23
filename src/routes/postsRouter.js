import { Router } from "express";
import { createPost } from "../controllers/postsController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const postsRouter = Router();

postsRouter.post("/posts", validateTokenMiddleware, validateSchemaMiddleware, createPost);

export default postsRouter;