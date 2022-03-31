import { Router } from "express";
import { createComment, listComments } from "../controllers/commentsController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const commentsRouter = Router();

commentsRouter.get('/comments/:postId', validateTokenMiddleware, listComments);
commentsRouter.post('/comments', validateTokenMiddleware, validateSchemaMiddleware, createComment);

export default commentsRouter;