import { Router } from "express";
import { createPost } from "../controllers/postsController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import { validateToken } from "../middlewares/validateToken.js";

const postsRouter = Router();

postsRouter.post("/posts", validateSchemaMiddleware, validateToken, createPost);

export default postsRouter;