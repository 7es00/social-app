import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

import { AppController } from './app.controller';
import { DatabaseModule } from './DB/db.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { RequestModule } from './modules/request/request.module';
import { NotificationModule } from './modules/notification/notification.module';
import { StoryModule } from './modules/story/story.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Scheduling (stories cron job)
    ScheduleModule.forRoot(),

    // Database
    DatabaseModule,

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req }) => ({ req }),
    }),

    // Feature Modules
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
    RequestModule,
    NotificationModule,
    StoryModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
