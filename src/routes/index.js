import { Router } from "express";
import postsRouter from "./postsRouter.js";

const router = Router();

router.use(postsRouter);

export default router;