import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from '../../common/enums';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  senderId: Types.ObjectId; // null = system/admin notification

  @Prop({ type: Types.ObjectId, ref: 'User' })
  receiverId: Types.ObjectId;

  @Prop({ enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  body: string;

  @Prop({ type: Types.ObjectId, default: null })
  targetId: Types.ObjectId; // post/comment/request id

  @Prop({ default: null })
  targetType: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: false })
  isSent: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  // For admin broadcast notifications
  @Prop({ default: false })
  isBroadcast: boolean;

  @Prop({ default: null })
  imageUrl: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.pre('save', function (next) {
  if (this.isModified('isDeleted') && this.isDeleted) {
    this.deletedAt = new Date();
  }
  next();
});
