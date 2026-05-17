import { Document, Types } from "mongoose";
import { UserRole, Gender } from "../enums";

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  coverPicture?: string;
  bio?: string;
  gender?: Gender;
  birthday?: Date;
  role: UserRole;
  isConfirmed: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  isOnline: boolean;
  lastSeen?: Date;
  fcmToken?: string;
  confirmationCode?: string;
  confirmationExpiry?: Date;
  resetPasswordCode?: string;
  resetPasswordExpiry?: Date;
  friends: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
