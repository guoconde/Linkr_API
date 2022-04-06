import { Router } from "express";
import postsRouter from "./postsRouter.js";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import hashtagsRouter from "./hashtagsRouter.js";
import commentsRouter from "./commentsRouter.js";
import geolocationRouter from "./geolocationRouter.js";

const router = Router();

router.use(postsRouter);
router.use(authRouter);
router.use(userRouter);
router.use(hashtagsRouter);
router.use(commentsRouter);
router.use(geolocationRouter);

export default router;
