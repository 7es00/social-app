export const SALT_ROUNDS = 10;
export const JWT_EXPIRES_IN = "7d";
export const CONFIRMATION_CODE_EXPIRY = 24 * 60 * 60 * 1000; // 24h
export const RESET_PASSWORD_EXPIRY = 10 * 60 * 1000; // 10min
export const STORY_EXPIRY_HOURS = 24;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
};

export const MESSAGES = {
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
  FETCHED: "Fetched successfully",
  NOT_FOUND: "Not found",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  CONFLICT: "Already exists",
  INVALID_CREDENTIALS: "Invalid credentials",
  ACCOUNT_NOT_CONFIRMED: "Please confirm your email first",
  ACCOUNT_DELETED: "This account has been deleted",
  EMAIL_SENT: "Email sent successfully",
  TOKEN_EXPIRED: "Token expired",
  TOKEN_INVALID: "Invalid token",
};

export const CLOUDINARY_FOLDERS = {
  PROFILE: "social-app/profiles",
  COVER: "social-app/covers",
  POST: "social-app/posts",
  COMMENT: "social-app/comments",
  STORY: "social-app/stories",
};
