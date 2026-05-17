import mongoose, { Schema } from "mongoose";
import { IReaction } from "../common/interfaces";
import { ReactionType } from "../common/enums";

const reactionSchema = new Schema<IReaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, refPath: "targetModel" },
    targetModel: { type: String, enum: ["Post", "Comment"], required: true },
    type: { type: String, enum: Object.values(ReactionType), required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One reaction per user per target
reactionSchema.index({ userId: 1, targetId: 1 }, { unique: true });

export const ReactionModel = mongoose.model<IReaction>("Reaction", reactionSchema);
