import { PostModel } from "../../../DB";
import { PostPrivacy } from "../../../common/enums";

export const postMutationResolvers = {
  createPost: async ({ content, privacy, location }: any, context: any) => {
    const userId = context.user?._id;
    if (!userId) throw new Error("Unauthorized");

    const post = await PostModel.create({
      userId,
      content,
      privacy: privacy || PostPrivacy.PUBLIC,
      location,
      media: [],
    });

    return PostModel.findById(post._id).populate("userId", "firstName lastName username profilePicture");
  },

  updatePost: async ({ id, content, privacy }: any, context: any) => {
    const userId = context.user?._id.toString();
    const post = await PostModel.findOne({ _id: id, isDeleted: false });
    if (!post) throw new Error("Post not found");
    if (post.userId.toString() !== userId) throw new Error("Forbidden");

    if (content !== undefined) post.content = content;
    if (privacy !== undefined) post.privacy = privacy;
    await post.save();
    return post;
  },

  deletePost: async ({ id }: any, context: any) => {
    const userId = context.user?._id.toString();
    const post = await PostModel.findOne({ _id: id, isDeleted: false });
    if (!post) throw new Error("Post not found");
    if (post.userId.toString() !== userId) throw new Error("Forbidden");
    post.isDeleted = true;
    await post.save();
    return "Post deleted successfully";
  },

  pinPost: async ({ id }: any, context: any) => {
    const userId = context.user?._id.toString();
    const post = await PostModel.findOne({ _id: id, userId, isDeleted: false });
    if (!post) throw new Error("Post not found");
    await PostModel.updateMany({ userId, isPinned: true }, { isPinned: false });
    post.isPinned = !post.isPinned;
    await post.save();
    return post;
  },
};
