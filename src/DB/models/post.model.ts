import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PostPrivacy, PostType, MediaType } from '../../common/enums';

export class MediaObject {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  publicId: string;

  @Prop({ enum: MediaType, default: MediaType.IMAGE })
  type: MediaType;
}

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ trim: true, maxlength: 5000 })
  content: string;

  @Prop({ type: [MediaObject], default: [] })
  media: MediaObject[];

  @Prop({ enum: PostPrivacy, default: PostPrivacy.PUBLIC })
  privacy: PostPrivacy;

  @Prop({ enum: PostType, default: PostType.POST })
  type: PostType;

  @Prop({ type: Types.ObjectId, ref: 'Post', default: null })
  sharedPost: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  tags: Types.ObjectId[];

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ default: 0 })
  sharesCount: number;

  @Prop({ default: 0 })
  viewsCount: number;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Cascade soft-delete comments + reactions on post soft-delete
PostSchema.pre('save', async function (next) {
  if (this.isModified('isDeleted') && this.isDeleted) {
    this.deletedAt = new Date();
    // Cascade handled in service layer for flexibility
  }
  next();
});

PostSchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: false });
  next();
});
