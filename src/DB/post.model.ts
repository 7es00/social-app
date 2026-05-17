import mongoose, { Schema } from "mongoose";
import { IPost, IMedia } from "../common/interfaces";
import { PostPrivacy, MediaType } from "../common/enums";

const mediaSchema = new Schema<IMedia>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, enum: Object.values(MediaType), required: true },
});

const postSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, maxlength: 5000, default: null },
    media: [mediaSchema],
    privacy: { type: String, enum: Object.values(PostPrivacy), default: PostPrivacy.PUBLIC },
    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    location: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    isPinned: { type: Boolean, default: false },
    shareCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: reaction count
postSchema.virtual("reactions", {
  ref: "Reaction",
  localField: "_id",
  foreignField: "targetId",
  count: false,
});

// Virtual: comment count
postSchema.virtual("commentsCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
  count: true,
  match: { isDeleted: false },
});

// Cascade delete comments and reactions when post is soft-deleted
postSchema.pre("save", async function (next) {
  if (this.isModified("isDeleted") && this.isDeleted) {
    this.deletedAt = new Date();
    await mongoose.model("Comment").updateMany(
      { postId: this._id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }
    );
    await mongoose.model("Reaction").deleteMany({ targetId: this._id, targetModel: "Post" });
  }
  next();
});

// Hard delete cascade
postSchema.pre("findOneAndDelete", async function (next) {
  const post = await this.model.findOne(this.getFilter());
  if (post) {
    await mongoose.model("Comment").deleteMany({ postId: post._id });
    await mongoose.model("Reaction").deleteMany({ targetId: post._id });
  }
  next();
});

// Index for feed queries
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ privacy: 1, isDeleted: 1 });

export const PostModel = mongoose.model<IPost>("Post", postSchema);
