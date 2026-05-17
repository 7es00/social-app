import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class AuthResponse {
  @Field()
  token: string;

  @Field(() => UserType)
  user: UserType;
}

@ObjectType()
export class UserType {
  @Field(() => ID)
  _id: string;

  @Field()
  username: string;

  @Field()
  email: string;

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

  @Field({ nullable: true })
  fcmToken: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class MessageResponse {
  @Field()
  message: string;

  @Field({ nullable: true })
  userId: string;
}
