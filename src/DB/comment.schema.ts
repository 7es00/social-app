import { Schema, model, Document, Types } from 'mongoose';
import { ReactionType } from '../../common/enums';

export interface CommentDocument extends Document {
  _id: Types.ObjectId;
  content: string;
  author: Types.ObjectId;
  post: Types.ObjectId;
  parentComment: Types.ObjectId;
  isDeleted: boolean;
  deletedAt: Date;
  reactions: { user: Types.ObjectId; type: ReactionType }[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<CommentDocument>(
  {
    content: { type: String, required: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: Object.values(ReactionType) },
      },
    ],
    images: [{ type: String }],
  },
  { timestamps: true },
);

// Cascade soft delete child comments (replies) when parent is soft deleted
CommentSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  if (update?.isDeleted === true || update?.$set?.isDeleted === true) {
    const commentId = this.getQuery()._id;
    if (commentId) {
      await this.model.updateMany(
        { parentComment: commentId, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() },
      );
    }
  }
  next();
});

// Hard delete: cascade to child comments
CommentSchema.pre('findOneAndDelete', async function (next) {
  const commentId = this.getQuery()._id;
  if (commentId) {
    await this.model.deleteMany({ parentComment: commentId });
  }
  next();
});

// Filter soft-deleted by default
CommentSchema.pre(/^find/, function (next) {
  const query = this as any;
  if (!query._conditions?.includeDeleted) {
    query.where({ isDeleted: false });
  }
  next();
});

CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ parentComment: 1 });

export const Comment = model<CommentDocument>('Comment', CommentSchema);
export { CommentSchema };
