import { Router } from "express";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";
import { listHashtagPosts } from "../controllers/feedControler.js"

const feedRouter = Router();
feedRouter.get('/hashtag/:hashtag', validateTokenMiddleware, listHashtagPosts);
export default feedRouter;