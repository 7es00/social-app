import mongoose, { Schema, Document, Types } from "mongoose";
import { MediaType } from "../common/enums";

export interface IStory extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  media: { url: string; publicId: string; type: MediaType };
  text?: string;
  viewers: Types.ObjectId[];
  expiresAt: Date;
  isDeleted: boolean;
  createdAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    media: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      type: { type: String, enum: Object.values(MediaType), required: true },
    },
    text: { type: String, maxlength: 500, default: null },
    viewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    expiresAt: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL index: auto-remove expired stories from DB
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ userId: 1, createdAt: -1 });

export const StoryModel = mongoose.model<IStory>("Story", storySchema);
