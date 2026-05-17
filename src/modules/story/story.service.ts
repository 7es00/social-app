import { StoryModel, UserModel } from "../../DB";
import { AppError } from "../../middleware/error.middleware";
import { MESSAGES, CLOUDINARY_FOLDERS, STORY_EXPIRY_HOURS } from "../../common/constant";
import { uploadToCloudinary, deleteFromCloudinary } from "../../common/service/cloudinary.service";
import { MediaType } from "../../common/enums";

export class StoryService {
  async createStory(userId: string, file: Express.Multer.File, text?: string) {
    const isVideo = file.mimetype.startsWith("video");
    const { url, publicId } = await uploadToCloudinary(
      file.path,
      CLOUDINARY_FOLDERS.STORY,
      isVideo ? "video" : "image"
    );

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + STORY_EXPIRY_HOURS);

    const story = await StoryModel.create({
      userId,
      media: { url, publicId, type: isVideo ? MediaType.VIDEO : MediaType.IMAGE },
      text,
      expiresAt,
    });

    return story;
  }

  async getFriendsStories(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);

    const friendIds = [...user.friends.map((f) => f.toString()), userId];
    const now = new Date();

    const stories = await StoryModel.find({
      userId: { $in: friendIds },
      expiresAt: { $gt: now },
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("userId", "firstName lastName username profilePicture");

    // Group by user
    const grouped: Record<string, any> = {};
    stories.forEach((story) => {
      const uid = (story.userId as any)._id.toString();
      if (!grouped[uid]) {
        grouped[uid] = {
          user: story.userId,
          stories: [],
          hasUnviewed: false,
        };
      }
      const isViewed = story.viewers.map((v) => v.toString()).includes(userId);
      grouped[uid].stories.push({ ...story.toObject(), isViewed });
      if (!isViewed) grouped[uid].hasUnviewed = true;
    });

    return Object.values(grouped);
  }

  async viewStory(storyId: string, viewerId: string) {
    const story = await StoryModel.findOne({
      _id: storyId,
      isDeleted: false,
      expiresAt: { $gt: new Date() },
    });
    if (!story) throw new AppError(MESSAGES.NOT_FOUND, 404);

    if (!story.viewers.map((v) => v.toString()).includes(viewerId)) {
      story.viewers.push(viewerId as any);
      await story.save();
    }

    return story;
  }

  async getMyStories(userId: string) {
    return StoryModel.find({
      userId,
      isDeleted: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  }

  async getStoryViewers(storyId: string, userId: string) {
    const story = await StoryModel.findOne({ _id: storyId, userId });
    if (!story) throw new AppError(MESSAGES.NOT_FOUND, 404);

    return StoryModel.findById(storyId).populate("viewers", "firstName lastName username profilePicture");
  }

  async deleteStory(storyId: string, userId: string, role: string) {
    const story = await StoryModel.findOne({ _id: storyId });
    if (!story) throw new AppError(MESSAGES.NOT_FOUND, 404);
    if (story.userId.toString() !== userId && role !== "admin") throw new AppError(MESSAGES.FORBIDDEN, 403);

    // Delete from cloudinary
    await deleteFromCloudinary(story.media.publicId, story.media.type === MediaType.VIDEO ? "video" : "image").catch(() => {});
    story.isDeleted = true;
    await story.save();
    return { message: MESSAGES.DELETED };
  }

  // Cron job: cleanup expired stories (supplement to TTL index)
  async cleanupExpiredStories() {
    const expired = await StoryModel.find({
      expiresAt: { $lt: new Date() },
      isDeleted: false,
    });

    for (const story of expired) {
      await deleteFromCloudinary(story.media.publicId, story.media.type === MediaType.VIDEO ? "video" : "image").catch(() => {});
      story.isDeleted = true;
      await story.save();
    }

    console.log(`🗑️  Cleaned up ${expired.length} expired stories`);
  }
}
