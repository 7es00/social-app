import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostQueryResolver } from './graphql/post.query.gql';
import { PostMutationResolver } from './graphql/post.mutation.gql';
import { Post, PostSchema } from '../../DB/models/post.model';
import { Comment, CommentSchema } from '../../DB/models/comment.model';
import { Reaction, ReactionSchema } from '../../DB/models/reaction.model';
import { User, UserSchema } from '../../DB/models/user.model';
import { Notification, NotificationSchema } from '../../DB/models/notification.model';
import { CloudinaryService } from '../../common/cloud/cloudinary.service';
import { FcmService } from '../../common/notification/fcm.service';
import { ReactionService } from '../comment/reaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
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
  controllers: [PostController],
  providers: [PostService, PostQueryResolver, PostMutationResolver, CloudinaryService, FcmService, ReactionService],
  exports: [PostService],
})
export class PostModule {}
