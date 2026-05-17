import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole, Gender } from '../../common/enums';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 30 })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, minlength: 8 })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ enum: Gender })
  gender: Gender;

  @Prop({ default: null })
  profilePicture: string;

  @Prop({ default: null })
  coverPicture: string;

  @Prop({ default: null, maxlength: 500 })
  bio: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true })
  location: string;

  @Prop({ trim: true })
  website: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  friends: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  blockedUsers: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  fcmTokens: string[];

  @Prop({ default: 0 })
  postsCount: number;

  @Prop({ default: null })
  verificationToken: string;

  @Prop({ default: null })
  resetPasswordToken: string;

  @Prop({ default: null })
  resetPasswordExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Virtual: fullName would go here if needed
UserSchema.virtual('friendsCount').get(function () {
  return this.friends?.length || 0;
});

// Soft-delete query helper
UserSchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: false });
  next();
});
