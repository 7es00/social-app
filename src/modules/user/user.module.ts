import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../../DB/models/user.model';
import { Post, PostSchema } from '../../DB/models/post.model';
import { Comment, CommentSchema } from '../../DB/models/comment.model';
import { Reaction, ReactionSchema } from '../../DB/models/reaction.model';
import { FriendRequest, FriendRequestSchema } from '../../DB/models/friend-request.model';
import { Story, StorySchema } from '../../DB/models/story.model';
import { CloudinaryService } from '../../common/cloud/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Reaction.name, schema: ReactionSchema },
      { name: FriendRequest.name, schema: FriendRequestSchema },
      { name: Story.name, schema: StorySchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({ secret: cs.get('JWT_SECRET') }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, CloudinaryService],
  exports: [UserService],
})
export class UserModule {}
