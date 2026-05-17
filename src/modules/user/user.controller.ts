import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types";
import { UserService } from "./user.service";
import { sendResponse } from "../../common/utils";
import { MESSAGES } from "../../common/constant";

const userService = new UserService();

export const getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getProfile(req.user!._id.toString());
    sendResponse(res, 200, MESSAGES.FETCHED, user);
  } catch (e) { next(e); }
};

export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getProfile(req.params.userId);
    sendResponse(res, 200, MESSAGES.FETCHED, user);
  } catch (e) { next(e); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.updateProfile(req.user!._id.toString(), req.body);
    sendResponse(res, 200, MESSAGES.UPDATED, user);
  } catch (e) { next(e); }
};

export const updateProfilePicture = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: "No file uploaded" }); return; }
    const user = await userService.updateProfilePicture(req.user!._id.toString(), req.file.path);
    sendResponse(res, 200, MESSAGES.UPDATED, user);
  } catch (e) { next(e); }
};

export const updateCoverPicture = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: "No file uploaded" }); return; }
    const user = await userService.updateCoverPicture(req.user!._id.toString(), req.file.path);
    sendResponse(res, 200, MESSAGES.UPDATED, user);
  } catch (e) { next(e); }
};

export const deleteMyAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await userService.softDeleteAccount(req.user!._id.toString());
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const hardDeleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await userService.hardDeleteAccount(req.params.userId);
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const searchUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q, page, limit } = req.query as any;
    const result = await userService.searchUsers(q, +page || 1, +limit || 10);
    sendResponse(res, 200, MESSAGES.FETCHED, result.users, result.meta);
  } catch (e) { next(e); }
};

export const getFriends = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const friends = await userService.getFriends(req.params.userId || req.user!._id.toString());
    sendResponse(res, 200, MESSAGES.FETCHED, friends);
  } catch (e) { next(e); }
};

export const getMutualFriends = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mutual = await userService.getMutualFriends(req.user!._id.toString(), req.params.userId);
    sendResponse(res, 200, MESSAGES.FETCHED, mutual);
  } catch (e) { next(e); }
};

export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await userService.getDashboardStats();
    sendResponse(res, 200, MESSAGES.FETCHED, stats);
  } catch (e) { next(e); }
};

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as any;
    const result = await userService.getAllUsers(+page || 1, +limit || 10);
    sendResponse(res, 200, MESSAGES.FETCHED, result.users, result.meta);
  } catch (e) { next(e); }
};

export const getProfilePosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as any;
    const result = await userService.getProfilePosts(
      req.params.userId,
      req.user!._id.toString(),
      +page || 1,
      +limit || 10
    );
    sendResponse(res, 200, MESSAGES.FETCHED, result.posts, result.meta);
  } catch (e) { next(e); }
};
