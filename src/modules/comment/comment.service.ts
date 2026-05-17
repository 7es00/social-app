import { CommentModel, PostModel } from "../../DB";
import { AppError } from "../../middleware/error.middleware";
import { MESSAGES, CLOUDINARY_FOLDERS } from "../../common/constant";
import { paginate } from "../../common/utils";
import { uploadToCloudinary } from "../../common/service/cloudinary.service";
import { createNotification } from "../notification/notification.service";
import { NotificationType } from "../../common/enums";

export class CommentService {
  async createComment(postId: string, userId: string, data: any, file?: Express.Multer.File) {
    const post = await PostModel.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new AppError(MESSAGES.NOT_FOUND, 404);

    let mediaUrl: string | undefined;
    if (file) {
      const { url } = await uploadToCloudinary(file.path, CLOUDINARY_FOLDERS.COMMENT, "image");
      mediaUrl = url;
    }

    const comment = await CommentModel.create({
      postId,
      userId,
      parentId: data.parentId || null,
      content: data.content,
      media: mediaUrl,
    });

    // Notify post owner
    if (post.userId.toString() !== userId) {
      await createNotification({
        recipientId: post.userId.toString(),
        senderId: userId,
        type: NotificationType.COMMENT,
        title: "New Comment",
        body: data.parentId ? "replied to your comment" : "commented on your post",
        data: { postId, commentId: comment._id.toString() },
      });
    }

    return comment.populate("userId", "firstName lastName username profilePicture");
  }

  async getPostComments(postId: string, page = 1, limit = 10) {
    const { skip } = paginate(page, limit);
    // Top-level comments only
    const [comments, total] = await Promise.all([
      CommentModel.find({ postId, parentId: null, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName username profilePicture"),
      CommentModel.countDocuments({ postId, parentId: null, isDeleted: false }),
    ]);
    return { comments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getCommentReplies(commentId: string, page = 1, limit = 10) {
    const { skip } = paginate(page, limit);
    const [replies, total] = await Promise.all([
      CommentModel.find({ parentId: commentId, isDeleted: false })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName username profilePicture"),
      CommentModel.countDocuments({ parentId: commentId, isDeleted: false }),
    ]);
    return { replies, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await CommentModel.findOne({ _id: commentId, isDeleted: false });
    if (!comment) throw new AppError(MESSAGES.NOT_FOUND, 404);
    if (comment.userId.toString() !== userId) throw new AppError(MESSAGES.FORBIDDEN, 403);

    comment.content = content;
    await comment.save();
    return comment;
  }

  async softDeleteComment(commentId: string, userId: string, role: string) {
    const comment = await CommentModel.findOne({ _id: commentId, isDeleted: false });
    if (!comment) throw new AppError(MESSAGES.NOT_FOUND, 404);
    if (comment.userId.toString() !== userId && role !== "admin") throw new AppError(MESSAGES.FORBIDDEN, 403);

    comment.isDeleted = true; // Hook cascades replies & reactions
    await comment.save();
    return { message: MESSAGES.DELETED };
  }

  async hardDeleteComment(commentId: string, userId: string, role: string) {
    const comment = await CommentModel.findOne({ _id: commentId });
    if (!comment) throw new AppError(MESSAGES.NOT_FOUND, 404);
    if (comment.userId.toString() !== userId && role !== "admin") throw new AppError(MESSAGES.FORBIDDEN, 403);
    await CommentModel.deleteOne({ _id: commentId });
    return { message: "Comment permanently deleted" };
  }
}
