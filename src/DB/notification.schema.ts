import { Schema, model, Document, Types } from 'mongoose';
import { NotificationType } from '../../common/enums';

export interface NotificationDocument extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  data: Record<string, any>;
  createdByAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed, default: {} },
    createdByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = model<NotificationDocument>(
  'Notification',
  NotificationSchema,
);
export { NotificationSchema };
