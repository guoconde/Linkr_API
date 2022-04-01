import { Router } from "express";
import { getHashtags } from "../controllers/hashtagsController.js";
import { listPosts } from "../controllers/postsController.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const hashtagsRouter = Router();

hashtagsRouter.get('/hashtags', validateTokenMiddleware, getHashtags);
hashtagsRouter.get('/hashtag/:hashtag', validateTokenMiddleware, listPosts);

export default hashtagsRouter;