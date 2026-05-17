import { NotificationModel } from "../../DB";
import { AppError } from "../../middleware/error.middleware";
import { MESSAGES } from "../../common/constant";
import { NotificationType } from "../../common/enums";
import { UserModel } from "../../DB";
import { sendFCMNotification, sendFCMToMultiple } from "../../common/service/fcm.service";

interface CreateNotificationParams {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  createdBy?: "admin" | "system";
}

export const createNotification = async (params: CreateNotificationParams) => {
  const notification = await NotificationModel.create({
    recipientId: params.recipientId,
    senderId: params.senderId || null,
    type: params.type,
    title: params.title,
    body: params.body,
    data: params.data || {},
    createdBy: params.createdBy || "system",
  });

  // Send FCM push notification
  const recipient = await UserModel.findById(params.recipientId).select("fcmToken");
  if (recipient?.fcmToken) {
    await sendFCMNotification(
      recipient.fcmToken,
      params.title,
      params.body,
      { type: params.type, ...Object.fromEntries(
        Object.entries(params.data || {}).map(([k, v]) => [k, String(v)])
      )}
    );
  }

  return notification;
};

export class NotificationService {
  // Admin: create notification for all or specific users
  async createAdminNotification(data: {
    title: string;
    body: string;
    type: NotificationType;
    recipientIds?: string[];
    broadcastAll?: boolean;
  }) {
    let recipients: string[] = [];

    if (data.broadcastAll) {
      const users = await UserModel.find({ isDeleted: false, isConfirmed: true }).select("_id fcmToken");
      recipients = users.map((u) => u._id.toString());

      // FCM broadcast
      const tokens = users.map((u) => u.fcmToken).filter(Boolean) as string[];
      if (tokens.length) await sendFCMToMultiple(tokens, data.title, data.body, { type: data.type });
    } else {
      recipients = data.recipientIds || [];
    }

    const notifications = await NotificationModel.insertMany(
      recipients.map((recipientId) => ({
        recipientId,
        type: data.type,
        title: data.title,
        body: data.body,
        createdBy: "admin",
      }))
    );

    return { message: `Notification sent to ${notifications.length} users`, count: notifications.length };
  }

  async getMyNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      NotificationModel.find({ recipientId: userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "firstName lastName username profilePicture"),
      NotificationModel.countDocuments({ recipientId: userId, isDeleted: false }),
      NotificationModel.countDocuments({ recipientId: userId, isRead: false, isDeleted: false }),
    ]);

    return {
      notifications,
      unreadCount,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return notification;
  }

  async markAllAsRead(userId: string) {
    await NotificationModel.updateMany({ recipientId: userId, isRead: false }, { isRead: true });
    return { message: "All notifications marked as read" };
  }

  async deleteNotification(notificationId: string, userId: string, role: string) {
    const filter: any = { _id: notificationId };
    if (role !== "admin") filter.recipientId = userId;

    const notification = await NotificationModel.findOneAndUpdate(
      filter,
      { isDeleted: true },
      { new: true }
    );
    if (!notification) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return { message: MESSAGES.DELETED };
  }

  async deleteAllMyNotifications(userId: string) {
    await NotificationModel.updateMany({ recipientId: userId }, { isDeleted: true });
    return { message: "All notifications deleted" };
  }

  async getAllNotificationsAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      NotificationModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("recipientId", "firstName lastName username")
        .populate("senderId", "firstName lastName username"),
      NotificationModel.countDocuments(),
    ]);
    return { notifications, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updateAdminNotification(notificationId: string, data: any) {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, createdBy: "admin" },
      { title: data.title, body: data.body },
      { new: true }
    );
    if (!notification) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return notification;
  }

  async hardDeleteNotification(notificationId: string) {
    await NotificationModel.findByIdAndDelete(notificationId);
    return { message: "Notification permanently deleted" };
  }
}
