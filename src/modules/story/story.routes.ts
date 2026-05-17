import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/upload.middleware";
import * as storyController from "./story.controller";

const router = Router();

router.use(authenticate);

router.post("/", upload.single("media"), storyController.createStory);
router.get("/", storyController.getFriendsStories);
router.get("/mine", storyController.getMyStories);
router.patch("/:storyId/view", storyController.viewStory);
router.get("/:storyId/viewers", storyController.getStoryViewers);
router.delete("/:storyId", storyController.deleteStory);

export default router;
