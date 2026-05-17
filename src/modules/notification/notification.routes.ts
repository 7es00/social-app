import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { UserRole } from "../../common/enums";
import * as notificationController from "./notification.controller";

const router = Router();

router.use(authenticate);

// User routes
router.get("/", notificationController.getMyNotifications);
router.patch("/:notificationId/read", notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);
router.delete("/all", notificationController.deleteAllMyNotifications);
router.delete("/:notificationId", notificationController.deleteNotification);

// Admin routes
router.post("/admin", authorize(UserRole.ADMIN), notificationController.createAdminNotification);
router.get("/admin/all", authorize(UserRole.ADMIN), notificationController.getAllNotificationsAdmin);
router.put("/admin/:notificationId", authorize(UserRole.ADMIN), notificationController.updateAdminNotification);
router.delete("/admin/:notificationId/hard", authorize(UserRole.ADMIN), notificationController.hardDeleteNotification);

export default router;
