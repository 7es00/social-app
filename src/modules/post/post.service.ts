import { PostModel, UserModel, ReactionModel } from "../../DB";
import { AppError } from "../../middleware/error.middleware";
import { MESSAGES, CLOUDINARY_FOLDERS, PAGINATION } from "../../common/constant";
import { paginate } from "../../common/utils";
import { uploadToCloudinary, deleteFromCloudinary } from "../../common/service/cloudinary.service";
import { PostPrivacy, MediaType } from "../../common/enums";
import { createNotification } from "../notification/notification.service";
import { NotificationType } from "../../common/enums";

export class PostService {
  async createPost(userId: string, data: any, files?: Express.Multer.File[]) {
    const mediaList: any[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const isVideo = file.mimetype.startsWith("video");
        const folder = CLOUDINARY_FOLDERS.POST;
        const { url, publicId } = await uploadToCloudinary(
          file.path,
          folder,
          isVideo ? "video" : "image"
        );
        mediaList.push({ url, publicId, type: isVideo ? MediaType.VIDEO : MediaType.IMAGE });
      }
    }

    const post = await PostModel.create({
      userId,
      content: data.content,
      privacy: data.privacy || PostPrivacy.PUBLIC,
      tags: data.tags || [],
      location: data.location,
      media: mediaList,
    });

    // Notify tagged users
    if (data.tags?.length) {
      for (const tagId of data.tags) {
        if (tagId !== userId) {
          await createNotification({
            recipientId: tagId,
            senderId: userId,
            type: NotificationType.MENTION,
            title: "Tagged in a Post",
            body: "You were tagged in a post",
            data: { postId: post._id.toString() },
          });
        }
      }
    }

    return PostModel.findById(post._id).populate("userId", "firstName lastName username profilePicture");
  }

  async getPost(postId: string, requesterId: string) {
    const post = await PostModel.findOne({ _id: postId, isDeleted: false })
      .populate("userId", "firstName lastName username profilePicture friends")
      .populate("tags", "firstName lastName username profilePicture");
    if (!post) throw new AppError(MESSAGES.NOT_FOUND, 404);
    this.checkPrivacyAccess(post, requesterId);
    return post;
  }

  private checkPrivacyAccess(post: any, requesterId: string) {
    const ownerId = post.userId._id.toString();
    if (ownerId === requesterId) return;
    if (post.privacy === PostPrivacy.ONLY_ME) throw new AppError(MESSAGES.FORBIDDEN, 403);
    if (post.privacy === PostPrivacy.FRIENDS) {
      const isFriend = post.userId.friends?.map((f: any) => f.toString()).includes(requesterId);
      if (!isFriend) throw new AppError(MESSAGES.FORBIDDEN, 403);
    }
  }

  async updatePost(postId: string, userId: string, data: any) {
    const post = await PostModel.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new AppError(MESSAGES.NOT_FOUND, 404);
    if (post.userId.toString() !== userId) throw new AppError(MESSAGES.FORBIDDEN, 403);

    Object.assign(post, {
      content: data.content ?? post.content,
      privacy: data.privacy ?? post.privacy,
      tags: data.tags ?? post.tags,
      location: data.location ?? post.location,
    });
    await post.save();
    return post;
  }

  async softDeletePost(postId: string, userId: string, role: string) {
    const post = await PostModel.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new AppError(MESSAGES.NOT_FOUND, 404);
    if (post.userId.toString() !== userId && role !== "admin") throw new AppError(MESSAGES.FORBIDDEN, 403);

    post.isDeleted = true; // Hook cascades comments & reactions
    await post.save();
    return { message: MESSAGES.DELETED };
  }

  async hardDeletePost(postId: string, userId: string, role: string) {
    const post = await PostModel.findOne({ _id: postId });
    if (!post) throw new AppError(MESSAGES.NOT_FOUND, 404);
    if (post.userId.toString() !== userId && role !== "admin") throw new AppError(MESSAGES.FORBIDDEN, 403);
    await PostModel.findByIdAndDelete(postId); // Hook cascades
    return { message: "Post permanently deleted" };
  }

  async getNewsFeed(userId: string, page = 1, limit = 10) {
    const { skip } = paginate(page, limit);
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);

    const friendIds = user.friends.map((f) => f.toString());

    // News feed: public posts + friends' posts
    const feedFilter = {
      isDeleted: false,
      $or: [
        { userId: { $in: friendIds }, privacy: { $in: [PostPrivacy.PUBLIC, PostPrivacy.FRIENDS] } },
        { userId: userId },
        { privacy: PostPrivacy.PUBLIC, userId: { $nin: [userId] } },
      ],
    };

    const [posts, total] = await Promise.all([
      PostModel.find(feedFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName username profilePicture")
        .populate("tags", "firstName lastName username"),
      PostModel.countDocuments(feedFilter),
    ]);

    // Attach reaction counts
    const postIds = posts.map((p) => p._id);
    const reactions = await ReactionModel.aggregate([
      { $match: { targetId: { $in: postIds }, targetModel: "Post" } },
      { $group: { _id: { targetId: "$targetId", type: "$type" }, count: { $sum: 1 } } },
    ]);

    const reactionMap: Record<string, Record<string, number>> = {};
    reactions.forEach((r) => {
      const id = r._id.targetId.toString();
      if (!reactionMap[id]) reactionMap[id] = {};
      reactionMap[id][r._id.type] = r.count;
    });

    const postsWithReactions = posts.map((p) => ({
      ...p.toObject(),
      reactions: reactionMap[p._id.toString()] || {},
    }));

    return { posts: postsWithReactions, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async pinPost(postId: string, userId: string) {
    const post = await PostModel.findOne({ _id: postId, userId, isDeleted: false });
    if (!post) throw new AppError(MESSAGES.NOT_FOUND, 404);

    // Unpin all other posts by this user first
    await PostModel.updateMany({ userId, isPinned: true }, { isPinned: false });

    post.isPinned = !post.isPinned;
    await post.save();
    return post;
  }

  async sharePost(postId: string, userId: string, content?: string) {
    const original = await PostModel.findOne({ _id: postId, isDeleted: false });
    if (!original) throw new AppError(MESSAGES.NOT_FOUND, 404);

    original.shareCount += 1;
    await original.save();

    const share = await PostModel.create({
      userId,
      content: content || "",
      privacy: PostPrivacy.PUBLIC,
      media: [],
      tags: [],
    });

    return share;
  }

  async getAllPostsAdmin(page = 1, limit = 10, includeDeleted = false) {
    const { skip } = paginate(page, limit);
    const filter = includeDeleted ? {} : { isDeleted: false };
    const [posts, total] = await Promise.all([
      PostModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName username profilePicture"),
      PostModel.countDocuments(filter),
    ]);
    return { posts, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
