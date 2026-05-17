import { RequestModel, UserModel } from "../../DB";
import { AppError } from "../../middleware/error.middleware";
import { MESSAGES } from "../../common/constant";
import { RequestStatus } from "../../common/enums";
import { createNotification } from "../notification/notification.service";
import { NotificationType } from "../../common/enums";

export class RequestService {
  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) throw new AppError("Cannot send request to yourself", 400);

    const receiver = await UserModel.findOne({ _id: receiverId, isDeleted: false });
    if (!receiver) throw new AppError(MESSAGES.NOT_FOUND, 404);

    const existing = await RequestModel.findOne({ senderId, receiverId });
    if (existing) throw new AppError("Friend request already sent", 409);

    const alreadyFriends = await UserModel.findOne({ _id: senderId, friends: receiverId });
    if (alreadyFriends) throw new AppError("Already friends", 409);

    const request = await RequestModel.create({ senderId, receiverId });

    await createNotification({
      recipientId: receiverId,
      senderId,
      type: NotificationType.FRIEND_REQUEST,
      title: "Friend Request",
      body: "sent you a friend request",
      data: { requestId: request._id.toString() },
    });

    return request;
  }

  async respondToRequest(requestId: string, receiverId: string, action: "accept" | "reject") {
    const request = await RequestModel.findOne({ _id: requestId, receiverId, status: RequestStatus.PENDING });
    if (!request) throw new AppError(MESSAGES.NOT_FOUND, 404);

    if (action === "accept") {
      request.status = RequestStatus.ACCEPTED;
      await request.save();

      // Add to friends lists (both directions)
      await UserModel.findByIdAndUpdate(receiverId, { $addToSet: { friends: request.senderId } });
      await UserModel.findByIdAndUpdate(request.senderId, { $addToSet: { friends: receiverId } });

      await createNotification({
        recipientId: request.senderId.toString(),
        senderId: receiverId,
        type: NotificationType.FRIEND_ACCEPTED,
        title: "Friend Request Accepted",
        body: "accepted your friend request",
        data: { userId: receiverId },
      });
    } else {
      request.status = RequestStatus.REJECTED;
      await request.save();
    }

    return request;
  }

  async cancelRequest(senderId: string, requestId: string) {
    const request = await RequestModel.findOne({ _id: requestId, senderId, status: RequestStatus.PENDING });
    if (!request) throw new AppError(MESSAGES.NOT_FOUND, 404);
    await RequestModel.deleteOne({ _id: requestId });
    return { message: "Request cancelled" };
  }

  async unfriend(userId: string, friendId: string) {
    await UserModel.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await UserModel.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
    await RequestModel.deleteOne({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    });
    return { message: "Unfriended successfully" };
  }

  async blockUser(userId: string, targetId: string) {
    await RequestModel.findOneAndUpdate(
      { $or: [{ senderId: userId, receiverId: targetId }, { senderId: targetId, receiverId: userId }] },
      { status: RequestStatus.BLOCKED },
      { upsert: true }
    );
    // Also unfriend if friends
    await UserModel.findByIdAndUpdate(userId, { $pull: { friends: targetId } });
    await UserModel.findByIdAndUpdate(targetId, { $pull: { friends: userId } });
    return { message: "User blocked" };
  }

  async unblockUser(userId: string, targetId: string) {
    await RequestModel.deleteOne({
      senderId: userId,
      receiverId: targetId,
      status: RequestStatus.BLOCKED,
    });
    return { message: "User unblocked" };
  }

  async getPendingRequests(userId: string) {
    return RequestModel.find({ receiverId: userId, status: RequestStatus.PENDING })
      .populate("senderId", "firstName lastName username profilePicture")
      .sort({ createdAt: -1 });
  }

  async getSentRequests(userId: string) {
    return RequestModel.find({ senderId: userId, status: RequestStatus.PENDING })
      .populate("receiverId", "firstName lastName username profilePicture")
      .sort({ createdAt: -1 });
  }
}
