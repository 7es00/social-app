import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as requestController from "./request.controller";

const router = Router();

router.use(authenticate);

router.get("/pending", requestController.getPendingRequests);
router.get("/sent", requestController.getSentRequests);
router.post("/send/:userId", requestController.sendFriendRequest);
router.patch("/:requestId/accept", requestController.acceptRequest);
router.patch("/:requestId/reject", requestController.rejectRequest);
router.delete("/:requestId/cancel", requestController.cancelRequest);
router.delete("/unfriend/:userId", requestController.unfriend);
router.post("/block/:userId", requestController.blockUser);
router.delete("/unblock/:userId", requestController.unblockUser);

export default router;
