import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reaction } from '../../DB/models/reaction.model';
import { Post } from '../../DB/models/post.model';
import { Comment } from '../../DB/models/comment.model';
import { User } from '../../DB/models/user.model';
import { Notification } from '../../DB/models/notification.model';
import { FcmService } from '../../common/notification/fcm.service';
import { ReactionType, NotificationType } from '../../common/enums';

@Injectable()
export class ReactionService {
  constructor(
    @InjectModel(Reaction.name) private reactionModel: Model<Reaction>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private fcmService: FcmService,
  ) {}

  async toggleReaction(
    userId: string,
    targetId: string,
    targetType: 'post' | 'comment',
    type: ReactionType,
  ) {
    const existing = await this.reactionModel.findOne({
      userId: new Types.ObjectId(userId),
      targetId: new Types.ObjectId(targetId),
      targetType,
    });

    const model = targetType === 'post' ? this.postModel : this.commentModel;

    if (existing) {
      if (existing.type === type) {
        // Remove reaction (toggle off)
        await this.reactionModel.deleteOne({ _id: existing._id });
        await (model as any).findByIdAndUpdate(targetId, { $inc: { likesCount: -1 } });
        return { message: 'Reaction removed', action: 'removed' };
      } else {
        // Change reaction type
        existing.type = type;
        await existing.save();
        return { message: 'Reaction updated', action: 'updated', type };
      }
    }

    // New reaction
    await this.reactionModel.create({
      userId: new Types.ObjectId(userId),
      targetId: new Types.ObjectId(targetId),
      targetType,
      type,
    });
    await (model as any).findByIdAndUpdate(targetId, { $inc: { likesCount: 1 } });

    // Send notification
    await this.sendReactionNotification(userId, targetId, targetType, type);

    return { message: 'Reaction added', action: 'added', type };
  }

  async removeReaction(userId: string, targetId: string) {
    const reaction = await this.reactionModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      targetId: new Types.ObjectId(targetId),
    });
    if (!reaction) throw new NotFoundException('Reaction not found');

    const model = reaction.targetType === 'post' ? this.postModel : this.commentModel;
    await (model as any).findByIdAndUpdate(targetId, { $inc: { likesCount: -1 } });
    return { message: 'Reaction removed' };
  }

  async getReactionSummary(targetId: string, targetType: string, requesterId: string) {
    const reactions = await this.reactionModel.find({
      targetId: new Types.ObjectId(targetId),
      targetType,
    });

    const breakdown = Object.values(ReactionType).map((type) => ({
      type,
      count: reactions.filter((r) => r.type === type).length,
    })).filter((r) => r.count > 0);

    const myReaction = reactions.find((r) => r.userId.toString() === requesterId)?.type;

    return { total: reactions.length, breakdown, myReaction: myReaction || null };
  }

  async getReactors(targetId: string, targetType: string, reactionType?: ReactionType, page = 1, limit = 20) {
    const query: any = { targetId: new Types.ObjectId(targetId), targetType };
    if (reactionType) query.type = reactionType;

    const reactions = await this.reactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'username profilePicture');

    return reactions;
  }

  private async sendReactionNotification(
    reactorId: string,
    targetId: string,
    targetType: string,
    type: ReactionType,
  ) {
    try {
      let ownerId: string;
      if (targetType === 'post') {
        const post = await this.postModel.findById(targetId).select('userId');
        ownerId = post?.userId?.toString();
      } else {
        const comment = await this.commentModel.findById(targetId).select('userId');
        ownerId = comment?.userId?.toString();
      }

      if (!ownerId || ownerId === reactorId) return;

      const reactor = await this.userModel.findById(reactorId).select('username');
      const owner = await this.userModel.findById(ownerId).select('fcmTokens');

      const emojiMap = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };

      await this.notificationModel.create({
        senderId: new Types.ObjectId(reactorId),
        receiverId: new Types.ObjectId(ownerId),
        type: NotificationType.REACTION,
        title: 'New Reaction',
        body: `${reactor.username} reacted ${emojiMap[type]} to your ${targetType}`,
        targetId: new Types.ObjectId(targetId),
        targetType,
      });

      if (owner?.fcmTokens?.length) {
        await this.fcmService.sendToMultiple(
          owner.fcmTokens,
          'New Reaction',
          `${reactor.username} reacted ${emojiMap[type]} to your ${targetType}`,
        );
      }
    } catch (err) {
      // Non-blocking
    }
  }
}
