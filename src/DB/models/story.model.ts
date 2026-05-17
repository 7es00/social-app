import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { StoryType } from '../../common/enums';

@Schema({ timestamps: true })
export class Story extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ enum: StoryType, required: true })
  type: StoryType;

  @Prop({ default: null })
  mediaUrl: string;

  @Prop({ default: null })
  mediaPublicId: string;

  @Prop({ default: null, maxlength: 500 })
  text: string;

  @Prop({ default: '#000000' })
  backgroundColor: string;

  @Prop({ default: '#ffffff' })
  textColor: string;

  @Prop({ default: null })
  font: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  viewers: Types.ObjectId[];

  @Prop({ required: true })
  expiresAt: Date; // 24h after creation

  @Prop({ default: false })
  isExpired: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const StorySchema = SchemaFactory.createForClass(Story);
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion
