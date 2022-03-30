import { Router } from "express";
import { createComment } from "../controllers/commentsController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const commentsRouter = Router();

commentsRouter.post('/comments', validateTokenMiddleware, validateSchemaMiddleware, createComment);

export default commentsRouter;