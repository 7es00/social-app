import { ReactionModel, PostModel, CommentModel, UserModel } from "../../DB";
import { AppError } from "../../middleware/error.middleware";
import { MESSAGES } from "../../common/constant";
import { ReactionType } from "../../common/enums";
import { createNotification } from "../notification/notification.service";
import { NotificationType } from "../../common/enums";

export class ReactionService {
  async reactToPost(userId: string, postId: string, type: ReactionType) {
    const post = await PostModel.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new AppError(MESSAGES.NOT_FOUND, 404);

    const existing = await ReactionModel.findOne({ userId, targetId: postId, targetModel: "Post" });

    if (existing) {
      if (existing.type === type) {
        // Toggle off (un-react)
        await ReactionModel.deleteOne({ _id: existing._id });
        return { message: "Reaction removed" };
      }
      // Change reaction type
      existing.type = type;
      await existing.save();
      return { message: "Reaction updated", reaction: existing };
    }

    const reaction = await ReactionModel.create({
      userId,
      targetId: postId,
      targetModel: "Post",
      type,
    });

    // Notify post owner
    if (post.userId.toString() !== userId) {
      await createNotification({
        recipientId: post.userId.toString(),
        senderId: userId,
        type: NotificationType.LIKE,
        title: "New Reaction",
        body: `reacted ${type} to your post`,
        data: { postId },
      });
    }

    return { message: "Reaction added", reaction };
  }

  async reactToComment(userId: string, commentId: string, type: ReactionType) {
    const comment = await CommentModel.findOne({ _id: commentId, isDeleted: false });
    if (!comment) throw new AppError(MESSAGES.NOT_FOUND, 404);

    const existing = await ReactionModel.findOne({ userId, targetId: commentId, targetModel: "Comment" });

    if (existing) {
      if (existing.type === type) {
        await ReactionModel.deleteOne({ _id: existing._id });
        return { message: "Reaction removed" };
      }
      existing.type = type;
      await existing.save();
      return { message: "Reaction updated", reaction: existing };
    }

    const reaction = await ReactionModel.create({
      userId,
      targetId: commentId,
      targetModel: "Comment",
      type,
    });

    return { message: "Reaction added", reaction };
  }

  async getPostReactions(postId: string) {
    const reactions = await ReactionModel.find({ targetId: postId, targetModel: "Post" })
      .populate("userId", "firstName lastName username profilePicture");

    const summary = Object.values(ReactionType).reduce((acc, type) => {
      acc[type] = reactions.filter((r) => r.type === type).length;
      return acc;
    }, {} as Record<string, number>);

    return { reactions, summary, total: reactions.length };
  }

  async getCommentReactions(commentId: string) {
    const reactions = await ReactionModel.find({ targetId: commentId, targetModel: "Comment" })
      .populate("userId", "firstName lastName username profilePicture");

    const summary = Object.values(ReactionType).reduce((acc, type) => {
      acc[type] = reactions.filter((r) => r.type === type).length;
      return acc;
    }, {} as Record<string, number>);

    return { reactions, summary, total: reactions.length };
  }

  async getUserReaction(userId: string, targetId: string) {
    return ReactionModel.findOne({ userId, targetId });
  }
}
