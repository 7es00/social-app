import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as reactionController from "./reaction.controller";

const router = Router();

router.use(authenticate);

router.post("/post/:postId", reactionController.reactToPost);
router.post("/comment/:commentId", reactionController.reactToComment);
router.get("/post/:postId", reactionController.getPostReactions);
router.get("/comment/:commentId", reactionController.getCommentReactions);

export default router;
