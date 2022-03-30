import { Router } from "express";
import postsRouter from "./postsRouter.js";
import authRouter from "./authRouter.js"
import userRouter from "./userRouter.js"
import hashtagsRouter from "./hashtagsRouter.js";
import commentsRouter from "./commentsRouter.js";

const router = Router();

router.use(postsRouter);
router.use(authRouter);
router.use(userRouter);
router.use(hashtagsRouter);
router.use(commentsRouter);

export default router;
