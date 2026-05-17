import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types";
import { NotificationService } from "./notification.service";
import { sendResponse } from "../../common/utils";
import { MESSAGES } from "../../common/constant";
import { UserRole } from "../../common/enums";

const notificationService = new NotificationService();

export const createAdminNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.createAdminNotification(req.body);
    sendResponse(res, 201, result.message, { count: result.count });
  } catch (e) { next(e); }
};

export const getMyNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as any;
    const result = await notificationService.getMyNotifications(
      req.user!._id.toString(),
      +page || 1,
      +limit || 20
    );
    sendResponse(res, 200, MESSAGES.FETCHED, result.notifications, result.meta);
  } catch (e) { next(e); }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.notificationId,
      req.user!._id.toString()
    );
    sendResponse(res, 200, MESSAGES.UPDATED, notification);
  } catch (e) { next(e); }
};

export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.markAllAsRead(req.user!._id.toString());
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.deleteNotification(
      req.params.notificationId,
      req.user!._id.toString(),
      req.user!.role
    );
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const deleteAllMyNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.deleteAllMyNotifications(req.user!._id.toString());
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const getAllNotificationsAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as any;
    const result = await notificationService.getAllNotificationsAdmin(+page || 1, +limit || 20);
    sendResponse(res, 200, MESSAGES.FETCHED, result.notifications, result.meta);
  } catch (e) { next(e); }
};

export const updateAdminNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationService.updateAdminNotification(req.params.notificationId, req.body);
    sendResponse(res, 200, MESSAGES.UPDATED, notification);
  } catch (e) { next(e); }
};

export const hardDeleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.hardDeleteNotification(req.params.notificationId);
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};
