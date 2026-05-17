import mongoose, { Schema } from "mongoose";
import { IRequest } from "../common/interfaces";
import { RequestStatus } from "../common/enums";

const requestSchema = new Schema<IRequest>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: Object.values(RequestStatus), default: RequestStatus.PENDING },
  },
  { timestamps: true }
);

requestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export const RequestModel = mongoose.model<IRequest>("Request", requestSchema);
