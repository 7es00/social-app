import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../../DB";
import { config } from "../../config";
import { MESSAGES, CONFIRMATION_CODE_EXPIRY, RESET_PASSWORD_EXPIRY } from "../../common/constant";
import { generateCode, isExpired } from "../../common/utils";
import {
  sendEmail,
  confirmationEmailTemplate,
  resetPasswordEmailTemplate,
} from "../../common/service/email.service";
import { AppError } from "../../middleware/error.middleware";

export class AuthService {
  async register(data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender?: string;
    birthday?: Date;
  }) {
    const existingUser = await UserModel.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });
    if (existingUser) throw new AppError(MESSAGES.CONFLICT, 409);

    const code = generateCode(6);
    const user = await UserModel.create({
      ...data,
      confirmationCode: code,
      confirmationExpiry: new Date(Date.now() + CONFIRMATION_CODE_EXPIRY),
    });

    await sendEmail(
      data.email,
      "Confirm Your Email",
      confirmationEmailTemplate(`${data.firstName} ${data.lastName}`, code)
    );

    return { message: "Registration successful. Please check your email for the confirmation code." };
  }

  async confirmEmail(email: string, code: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);
    if (user.isConfirmed) throw new AppError("Email already confirmed", 400);
    if (user.confirmationCode !== code) throw new AppError("Invalid confirmation code", 400);
    if (user.confirmationExpiry && isExpired(user.confirmationExpiry))
      throw new AppError(MESSAGES.TOKEN_EXPIRED, 400);

    user.isConfirmed = true;
    user.confirmationCode = undefined;
    user.confirmationExpiry = undefined;
    await user.save();
    return { message: "Email confirmed successfully" };
  }

  async login(email: string, password: string, fcmToken?: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new AppError(MESSAGES.INVALID_CREDENTIALS, 401);
    if (user.isDeleted) throw new AppError(MESSAGES.ACCOUNT_DELETED, 403);
    if (!user.isConfirmed) throw new AppError(MESSAGES.ACCOUNT_NOT_CONFIRMED, 403);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError(MESSAGES.INVALID_CREDENTIALS, 401);

    // Update online status + FCM token
    user.isOnline = true;
    user.lastSeen = new Date();
    if (fcmToken) user.fcmToken = fcmToken;
    await user.save();

    const token = jwt.sign({ id: user._id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });

    return { token, user };
  }

  async logout(userId: string) {
    await UserModel.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
    return { message: "Logged out successfully" };
  }

  async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);

    const code = generateCode(6);
    user.resetPasswordCode = code;
    user.resetPasswordExpiry = new Date(Date.now() + RESET_PASSWORD_EXPIRY);
    await user.save();

    await sendEmail(
      email,
      "Reset Your Password",
      resetPasswordEmailTemplate(user.firstName, code)
    );
    return { message: MESSAGES.EMAIL_SENT };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);
    if (user.resetPasswordCode !== code) throw new AppError("Invalid reset code", 400);
    if (user.resetPasswordExpiry && isExpired(user.resetPasswordExpiry))
      throw new AppError(MESSAGES.TOKEN_EXPIRED, 400);

    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();
    return { message: "Password reset successfully" };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new AppError("Old password is incorrect", 400);

    user.password = newPassword;
    await user.save();
    return { message: "Password changed successfully" };
  }

  async resendConfirmation(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);
    if (user.isConfirmed) throw new AppError("Email already confirmed", 400);

    const code = generateCode(6);
    user.confirmationCode = code;
    user.confirmationExpiry = new Date(Date.now() + CONFIRMATION_CODE_EXPIRY);
    await user.save();

    await sendEmail(
      email,
      "Confirm Your Email",
      confirmationEmailTemplate(user.firstName, code)
    );
    return { message: MESSAGES.EMAIL_SENT };
  }
}
