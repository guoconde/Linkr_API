import { Router } from "express";
import postsRouter from "./postsRouter.js";
import authRouter from "./authRouter.js"
import userRouter from "./userRouter.js"
import hashtagsRouter from "./hashtagsRouter.js";

const router = Router();

router.use(postsRouter);
router.use(authRouter);
router.use(userRouter);
router.use(hashtagsRouter);

export default router;
