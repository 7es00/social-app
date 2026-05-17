import mongoose, { Schema, Document, Types } from "mongoose";
import { NotificationType } from "../common/enums";

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipientId: Types.ObjectId;
  senderId?: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  isDeleted: boolean;
  createdBy: "admin" | "system";
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String, enum: ["admin", "system"], default: "system" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>("Notification", notificationSchema);
