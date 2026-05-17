import { Document, Types } from "mongoose";
import { RequestStatus } from "../enums";

export interface IRequest extends Document {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}
