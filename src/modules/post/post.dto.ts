import { IsString, IsOptional, IsEnum, IsArray, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostPrivacy, PostType } from '../../common/enums';

export class CreatePostDto {
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
  @ApiPropertyOptional({ enum: PostPrivacy }) @IsOptional() @IsEnum(PostPrivacy) privacy?: PostPrivacy;
  @ApiPropertyOptional({ enum: PostType }) @IsOptional() @IsEnum(PostType) type?: PostType;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() sharedPost?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() tags?: string[];
}

export class UpdatePostDto {
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
  @ApiPropertyOptional({ enum: PostPrivacy }) @IsOptional() @IsEnum(PostPrivacy) privacy?: PostPrivacy;
}

export class GetPostsQueryDto {
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
  @IsOptional() userId?: string;
}
