import { PostModel } from "../../../DB";
import { PostPrivacy } from "../../../common/enums";

export const postQueryResolvers = {
  getPost: async ({ id }: { id: string }, context: any) => {
    const post = await PostModel.findOne({ _id: id, isDeleted: false })
      .populate("userId", "firstName lastName username profilePicture")
      .populate("tags", "firstName lastName username profilePicture");
    return post;
  },

  getFeed: async ({ page = 1, limit = 10 }: any, context: any) => {
    const userId = context.user?._id.toString();
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      PostModel.find({ isDeleted: false, privacy: PostPrivacy.PUBLIC })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName username profilePicture"),
      PostModel.countDocuments({ isDeleted: false, privacy: PostPrivacy.PUBLIC }),
    ]);

    return { posts, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getUserPosts: async ({ userId, page = 1, limit = 10 }: any) => {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      PostModel.find({ userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName username profilePicture"),
      PostModel.countDocuments({ userId, isDeleted: false }),
    ]);
    return { posts, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};
