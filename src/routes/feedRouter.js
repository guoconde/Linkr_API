import { Router } from "express";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";
import { listHashtagPosts, listUserPosts } from "../controllers/feedControler.js"

const feedRouter = Router();
feedRouter.get('/hashtag/:hashtag', validateTokenMiddleware, listHashtagPosts);
feedRouter.get('/user/:id', validateTokenMiddleware, listUserPosts);
export default feedRouter;