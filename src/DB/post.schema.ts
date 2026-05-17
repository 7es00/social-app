import { Schema, model, Document, Types } from 'mongoose';
import { PostPrivacy, ReactionType } from '../../common/enums';

export interface ReactionDocument {
  user: Types.ObjectId;
  type: ReactionType;
  createdAt: Date;
}

export interface PostDocument extends Document {
  _id: Types.ObjectId;
  content: string;
  images: string[];
  author: Types.ObjectId;
  privacy: PostPrivacy;
  isDeleted: boolean;
  deletedAt: Date;
  reactions: ReactionDocument[];
  tags: Types.ObjectId[];
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<ReactionDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: Object.values(ReactionType), required: true },
  },
  { timestamps: true },
);

const PostSchema = new Schema<PostDocument>(
  {
    content: { type: String, required: true, trim: true },
    images: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    privacy: {
      type: String,
      enum: Object.values(PostPrivacy),
      default: PostPrivacy.PUBLIC,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    reactions: [ReactionSchema],
    tags: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    location: { type: String, default: '' },
  },
  { timestamps: true },
);

// Cascade soft delete to comments when post is soft-deleted
PostSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  if (update?.isDeleted === true || update?.$set?.isDeleted === true) {
    const postId = this.getQuery()._id;
    if (postId) {
      const CommentModel = this.model.db.model('Comment');
      await CommentModel.updateMany(
        { post: postId, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() },
      );
    }
  }
  next();
});

// Cascade hard delete to comments
PostSchema.pre('findOneAndDelete', async function (next) {
  const postId = this.getQuery()._id;
  if (postId) {
    const CommentModel = this.model.db.model('Comment');
    await CommentModel.deleteMany({ post: postId });
  }
  next();
});

// Filter soft-deleted by default
PostSchema.pre(/^find/, function (next) {
  const query = this as any;
  if (!query._conditions?.includeDeleted) {
    query.where({ isDeleted: false });
  }
  next();
});

PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ privacy: 1 });
PostSchema.index({ isDeleted: 1 });

export const Post = model<PostDocument>('Post', PostSchema);
export { PostSchema };
