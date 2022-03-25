import { Router } from "express";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";
import { changeLike, getLikes, listHashtagPosts, listUserPosts, newLike } from "../controllers/feedControler.js"

const feedRouter = Router();
feedRouter.get('/hashtag/:hashtag', validateTokenMiddleware, listHashtagPosts);
feedRouter.get('/user/:id', validateTokenMiddleware, listUserPosts);
feedRouter.get('/posts/:id', validateTokenMiddleware, getLikes)
feedRouter.put('/posts/:id', validateTokenMiddleware, changeLike)
feedRouter.post('/posts/:id', validateTokenMiddleware, newLike)
export default feedRouter;