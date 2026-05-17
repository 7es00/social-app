export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum PostPrivacy {
  PUBLIC = "public",
  FRIENDS = "friends",
  ONLY_ME = "only_me",
}

export enum ReactionType {
  LIKE = "like",
  LOVE = "love",
  HAHA = "haha",
  WOW = "wow",
  SAD = "sad",
  ANGRY = "angry",
}

export enum FriendStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  BLOCKED = "blocked",
  REJECTED = "rejected",
}

export enum NotificationType {
  LIKE = "like",
  COMMENT = "comment",
  FRIEND_REQUEST = "friend_request",
  FRIEND_ACCEPTED = "friend_accepted",
  MENTION = "mention",
  STORY = "story",
  SYSTEM = "system",
}

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

export enum RequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  BLOCKED = "blocked",
}
