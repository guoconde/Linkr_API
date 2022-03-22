import { Router } from "express";
import { createPost } from "../controllers/postsController.js";

const postsRouter = Router();

postsRouter.post("/posts", createPost);

export default postsRouter;