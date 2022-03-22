import { Router } from "express";
import { createPost } from "../controllers/postsController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";

const postsRouter = Router();

postsRouter.post("/posts", validateSchemaMiddleware, createPost);

export default postsRouter;