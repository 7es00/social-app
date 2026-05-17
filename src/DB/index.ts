import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export { UserModel } from "./user.model";
export { PostModel } from "./post.model";
export { CommentModel } from "./comment.model";
export { ReactionModel } from "./reaction.model";
export { RequestModel } from "./request.model";
export { NotificationModel } from "./notification.model";
export { StoryModel } from "./story.model";
