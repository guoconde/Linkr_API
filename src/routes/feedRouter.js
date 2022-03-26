import { Router } from "express";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";
import { deleteLike, getLikes, listHashtagPosts, listUserPosts, newLike } from "../controllers/feedControler.js"

const feedRouter = Router();
feedRouter.get('/hashtag/:hashtag', validateTokenMiddleware, listHashtagPosts);
feedRouter.get('/user/:id', validateTokenMiddleware, listUserPosts);
feedRouter.get('/posts/:id/like', validateTokenMiddleware, getLikes)
feedRouter.put('/posts/:id/like', validateTokenMiddleware, deleteLike)
feedRouter.post('/posts/:id/like', validateTokenMiddleware, newLike)
export default feedRouter;