import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../common/utils";

const authService = new AuthService();

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    sendResponse(res, 201, result.message);
  } catch (e) { next(e); }
};

export const confirmEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.confirmEmail(req.body.email, req.body.code);
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body.email, req.body.password, req.body.fcmToken);
    sendResponse(res, 200, "Login successful", result);
  } catch (e) { next(e); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.logout(req.user!._id.toString());
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const forgotPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.resetPassword(req.body.email, req.body.code, req.body.newPassword);
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.changePassword(
      req.user!._id.toString(),
      req.body.oldPassword,
      req.body.newPassword
    );
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const resendConfirmation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.resendConfirmation(req.body.email);
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};
