import { Schema, model, Document, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserRole, Gender } from '../../common/enums';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  coverPhoto: string;
  bio: string;
  gender: Gender;
  birthDate: Date;
  role: UserRole;
  isDeleted: boolean;
  deletedAt: Date;
  isVerified: boolean;
  verificationToken: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  fcmToken: string;
  friends: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    profilePicture: { type: String, default: '' },
    coverPhoto: { type: String, default: '' },
    bio: { type: String, default: '' },
    gender: { type: String, enum: Object.values(Gender) },
    birthDate: { type: Date },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    fcmToken: { type: String, default: null },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Soft delete cascade hook - when user is soft deleted, cascade to their posts/comments
UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  if (update?.isDeleted === true || update?.$set?.isDeleted === true) {
    const userId = this.getQuery()._id || this.getQuery().id;
    if (userId) {
      const PostModel = this.model.db.model('Post');
      const CommentModel = this.model.db.model('Comment');
      const StoryModel = this.model.db.model('Story');
      const now = new Date();

      await Promise.all([
        PostModel.updateMany(
          { author: userId, isDeleted: false },
          { isDeleted: true, deletedAt: now },
        ),
        CommentModel.updateMany(
          { author: userId, isDeleted: false },
          { isDeleted: true, deletedAt: now },
        ),
        StoryModel.updateMany(
          { author: userId, isDeleted: false },
          { isDeleted: true, deletedAt: now },
        ),
      ]);
    }
  }
  next();
});

// Filter out soft-deleted users by default
UserSchema.pre(/^find/, function (next) {
  const query = this as any;
  if (!query._conditions?.includeDeleted) {
    query.where({ isDeleted: false });
  }
  next();
});

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ isDeleted: 1 });

export const User = model<UserDocument>('User', UserSchema);
export { UserSchema };
