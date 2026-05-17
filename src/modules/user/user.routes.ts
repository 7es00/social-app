import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/upload.middleware";
import { UserRole } from "../../common/enums";
import * as userController from "./user.controller";

const router = Router();

router.use(authenticate);

// Profile
router.get("/me", userController.getMyProfile);
router.put("/me", userController.updateProfile);
router.put("/me/profile-picture", upload.single("media"), userController.updateProfilePicture);
router.put("/me/cover-picture", upload.single("media"), userController.updateCoverPicture);
router.delete("/me", userController.deleteMyAccount);

// Social
router.get("/search", userController.searchUsers);
router.get("/friends", userController.getFriends);
router.get("/:userId", userController.getUserProfile);
router.get("/:userId/friends", userController.getFriends);
router.get("/:userId/mutual-friends", userController.getMutualFriends);
router.get("/:userId/posts", userController.getProfilePosts);

// Admin
router.get("/admin/dashboard", authorize(UserRole.ADMIN), userController.getDashboard);
router.get("/admin/all", authorize(UserRole.ADMIN), userController.getAllUsers);
router.delete("/admin/:userId", authorize(UserRole.ADMIN), userController.hardDeleteUser);

export default router;
