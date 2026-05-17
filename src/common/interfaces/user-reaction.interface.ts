import { Document, Types } from "mongoose";
import { ReactionType } from "../enums";

export interface IReaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  targetId: Types.ObjectId;
  targetModel: "Post" | "Comment";
  type: ReactionType;
  createdAt: Date;
}
