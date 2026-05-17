import { Schema, model, Document, Types } from 'mongoose';
import { FriendStatus } from '../../common/enums';

export interface FriendRequestDocument extends Document {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  status: FriendStatus;
  createdAt: Date;
  updatedAt: Date;
}

const FriendRequestSchema = new Schema<FriendRequestDocument>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(FriendStatus),
      default: FriendStatus.PENDING,
    },
  },
  { timestamps: true },
);

FriendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });
FriendRequestSchema.index({ recipient: 1, status: 1 });

export const FriendRequest = model<FriendRequestDocument>(
  'FriendRequest',
  FriendRequestSchema,
);
export { FriendRequestSchema };
