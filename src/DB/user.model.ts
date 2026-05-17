import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../common/interfaces";
import { UserRole, Gender } from "../common/enums";
import { SALT_ROUNDS } from "../common/constant";

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    profilePicture: { type: String, default: null },
    coverPicture: { type: String, default: null },
    bio: { type: String, maxlength: 500, default: null },
    gender: { type: String, enum: Object.values(Gender), default: null },
    birthday: { type: Date, default: null },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    isConfirmed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null },
    fcmToken: { type: String, default: null },
    confirmationCode: { type: String, default: null },
    confirmationExpiry: { type: Date, default: null },
    resetPasswordCode: { type: String, default: null },
    resetPasswordExpiry: { type: Date, default: null },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// Soft delete cascade hook
userSchema.pre("save", async function (next) {
  if (this.isModified("isDeleted") && this.isDeleted) {
    this.deletedAt = new Date();
    // Cascade: soft-delete all posts by this user
    await mongoose.model("Post").updateMany(
      { userId: this._id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }
    );
    // Cascade: soft-delete all comments by this user
    await mongoose.model("Comment").updateMany(
      { userId: this._id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }
    );
    // Remove friend requests
    await mongoose.model("Request").deleteMany({
      $or: [{ senderId: this._id }, { receiverId: this._id }],
    });
    // Remove from friends lists
    await mongoose.model("User").updateMany(
      { friends: this._id },
      { $pull: { friends: this._id } }
    );
  }
  next();
});

// Exclude deleted users and passwords by default
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.confirmationCode;
    delete ret.resetPasswordCode;
    return ret;
  },
});

export const UserModel = mongoose.model<IUser>("User", userSchema);
