import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class UserPublicType {
  @Field(() => ID)
  _id: string;

  @Field()
  username: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  profilePicture: string;

  @Field({ nullable: true })
  coverPhoto: string;

  @Field({ nullable: true })
  bio: string;

  @Field()
  role: string;

  @Field()
  isVerified: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class FriendRequestType {
  @Field(() => ID)
  _id: string;

  @Field(() => UserPublicType)
  sender: UserPublicType;

  @Field(() => ID)
  recipient: string;

  @Field()
  status: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class DashboardType {
  @Field(() => Int)
  totalUsers: number;

  @Field(() => Int)
  totalPosts: number;

  @Field(() => Int)
  newUsersToday: number;

  @Field(() => Int)
  activeUsers: number;
}

@ObjectType()
export class PaginatedUsers {
  @Field(() => [UserPublicType])
  data: UserPublicType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPrevPage: boolean;
}
