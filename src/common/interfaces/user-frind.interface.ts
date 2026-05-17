import { Document, Types } from "mongoose";

export interface IFriend extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  friendId: Types.ObjectId;
  createdAt: Date;
}
