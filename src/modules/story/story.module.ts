import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { Story, StorySchema } from '../../DB/models/story.model';
import { User, UserSchema } from '../../DB/models/user.model';
import { CloudinaryService } from '../../common/cloud/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({ secret: cs.get('JWT_SECRET') }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [StoryController],
  providers: [StoryService, CloudinaryService],
  exports: [StoryService],
})
export class StoryModule {}
