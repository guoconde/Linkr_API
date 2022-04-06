import { Router } from "express";
import { createPost, deleteLike, deletePost, listLastPost, listPosts, newLike, repost, updatePost } from "../controllers/postsController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const postsRouter = Router();

postsRouter.get('/posts', validateTokenMiddleware, listPosts);
postsRouter.get('/posts/:id/lastPost', validateTokenMiddleware, listLastPost);
postsRouter.post('/posts', validateTokenMiddleware, validateSchemaMiddleware, createPost);
postsRouter.post('/posts/:id/like', validateTokenMiddleware, newLike);
postsRouter.put('/posts/:id/like', validateTokenMiddleware, deleteLike);
postsRouter.put('/posts/:id', validateTokenMiddleware, validateSchemaMiddleware, updatePost);
postsRouter.delete('/posts/:id', validateTokenMiddleware, deletePost);
postsRouter.post('/posts/:id/repost', validateTokenMiddleware, repost);

export default postsRouter;