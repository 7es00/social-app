import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { FriendRequest, FriendRequestSchema } from '../../DB/models/friend-request.model';
import { User, UserSchema } from '../../DB/models/user.model';
import { Notification, NotificationSchema } from '../../DB/models/notification.model';
import { FcmService } from '../../common/notification/fcm.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FriendRequest.name, schema: FriendRequestSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({ secret: cs.get('JWT_SECRET') }),
      inject: [ConfigService],
    }),
  ],
  controllers: [RequestController],
  providers: [RequestService, FcmService],
  exports: [RequestService],
})
export class RequestModule {}
