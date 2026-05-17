import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { ReactionService } from './reaction.service';
import { Comment, CommentSchema } from '../../DB/models/comment.model';
import { Post, PostSchema } from '../../DB/models/post.model';
import { Reaction, ReactionSchema } from '../../DB/models/reaction.model';
import { User, UserSchema } from '../../DB/models/user.model';
import { Notification, NotificationSchema } from '../../DB/models/notification.model';
import { FcmService } from '../../common/notification/fcm.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
      { name: Reaction.name, schema: ReactionSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({ secret: cs.get('JWT_SECRET') }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CommentController],
  providers: [CommentService, ReactionService, FcmService],
  exports: [CommentService, ReactionService],
})
export class CommentModule {}
