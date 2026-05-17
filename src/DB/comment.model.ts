import mongoose, { Schema } from "mongoose";
import { IComment } from "../common/interfaces";

const commentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    content: { type: String, required: true, maxlength: 2000 },
    media: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: replies count
commentSchema.virtual("repliesCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentId",
  count: true,
  match: { isDeleted: false },
});

// Cascade: soft delete replies when parent comment is soft-deleted
commentSchema.pre("save", async function (next) {
  if (this.isModified("isDeleted") && this.isDeleted) {
    this.deletedAt = new Date();
    // Delete replies (hard - replies are ephemeral)
    await mongoose.model("Comment").updateMany(
      { parentId: this._id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }
    );
    // Remove reactions on this comment
    await mongoose.model("Reaction").deleteMany({ targetId: this._id, targetModel: "Comment" });
  }
  next();
});

commentSchema.index({ postId: 1, parentId: 1, createdAt: -1 });

export const CommentModel = mongoose.model<IComment>("Comment", commentSchema);
