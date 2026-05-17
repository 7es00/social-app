import { Schema, model, Document, Types } from 'mongoose';
import { MediaType } from '../../common/enums';
import { STORY_EXPIRY_HOURS } from '../../common/constant';

export interface StoryDocument extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  media: string;
  mediaType: MediaType;
  caption: string;
  viewers: { user: Types.ObjectId; viewedAt: Date }[];
  expiresAt: Date;
  isDeleted: boolean;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<StoryDocument>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    media: { type: String, required: true },
    mediaType: {
      type: String,
      enum: Object.values(MediaType),
      default: MediaType.IMAGE,
    },
    caption: { type: String, default: '' },
    viewers: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    expiresAt: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setHours(d.getHours() + STORY_EXPIRY_HOURS);
        return d;
      },
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index - auto deletes after expiresAt
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Filter expired and deleted stories
StorySchema.pre(/^find/, function (next) {
  const query = this as any;
  if (!query._conditions?.includeDeleted) {
    query.where({ isDeleted: false, expiresAt: { $gt: new Date() } });
  }
  next();
});

StorySchema.index({ author: 1, expiresAt: -1 });

export const Story = model<StoryDocument>('Story', StorySchema);
export { StorySchema };
