import { Router } from "express";
import { getHashtags } from "../controllers/hashtagsController.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const hashtagsRouter = Router();
hashtagsRouter.get('/hashtags', validateTokenMiddleware,getHashtags);
export default hashtagsRouter;