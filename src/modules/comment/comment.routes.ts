import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/upload.middleware";
import { UserRole } from "../../common/enums";
import * as commentController from "./comment.controller";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", upload.single("media"), commentController.createComment);
router.get("/", commentController.getPostComments);
router.get("/:commentId/replies", commentController.getCommentReplies);
router.put("/:commentId", commentController.updateComment);
router.delete("/:commentId", commentController.softDeleteComment);
router.delete("/:commentId/hard", authorize(UserRole.ADMIN), commentController.hardDeleteComment);

export default router;
