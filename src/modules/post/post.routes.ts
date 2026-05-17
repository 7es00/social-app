import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/upload.middleware";
import { UserRole } from "../../common/enums";
import * as postController from "./post.controller";

const router = Router();

router.use(authenticate);

// Feed
router.get("/feed", postController.getNewsFeed);

// Admin
router.get("/admin/all", authorize(UserRole.ADMIN), postController.getAllPostsAdmin);

// CRUD
router.post("/", upload.array("media", 10), postController.createPost);
router.get("/:postId", postController.getPost);
router.put("/:postId", postController.updatePost);
router.delete("/:postId", postController.softDeletePost);
router.delete("/:postId/hard", authorize(UserRole.ADMIN), postController.hardDeletePost);

// Actions
router.patch("/:postId/pin", postController.pinPost);
router.post("/:postId/share", postController.sharePost);

export default router;
