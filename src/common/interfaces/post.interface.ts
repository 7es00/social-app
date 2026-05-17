import { Document, Types } from "mongoose";
import { PostPrivacy, MediaType } from "../enums";

export interface IMedia {
  url: string;
  publicId: string;
  type: MediaType;
}

export interface IPost extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content?: string;
  media: IMedia[];
  privacy: PostPrivacy;
  tags: Types.ObjectId[];
  location?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  isPinned: boolean;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
}
