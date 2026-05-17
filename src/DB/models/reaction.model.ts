import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReactionType } from '../../common/enums';

@Schema({ timestamps: true })
export class Reaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId;

  @Prop({ required: true, enum: ['post', 'comment'] })
  targetType: string;

  @Prop({ enum: ReactionType, required: true })
  type: ReactionType;
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
ReactionSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
