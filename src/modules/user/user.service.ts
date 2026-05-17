import { UserModel, PostModel, RequestModel } from "../../DB";
import { AppError } from "../../middleware/error.middleware";
import { MESSAGES, PAGINATION, CLOUDINARY_FOLDERS } from "../../common/constant";
import { paginate } from "../../common/utils";
import { uploadToCloudinary, deleteFromCloudinary } from "../../common/service/cloudinary.service";
import { PostPrivacy } from "../../common/enums";

export class UserService {
  async getProfile(userId: string) {
    const user = await UserModel.findOne({ _id: userId, isDeleted: false })
      .select("-password -confirmationCode -resetPasswordCode")
      .populate("friends", "firstName lastName username profilePicture isOnline");
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return user;
  }

  async updateProfile(userId: string, data: any) {
    const forbidden = ["password", "email", "role", "isConfirmed", "isDeleted"];
    forbidden.forEach((f) => delete data[f]);

    const user = await UserModel.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return user;
  }

  async updateProfilePicture(userId: string, filePath: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);

    // Delete old picture from cloudinary
    if (user.profilePicture) {
      const oldPublicId = user.profilePicture.split("/").pop()?.split(".")[0];
      if (oldPublicId) await deleteFromCloudinary(`${CLOUDINARY_FOLDERS.PROFILE}/${oldPublicId}`).catch(() => {});
    }

    const { url } = await uploadToCloudinary(filePath, CLOUDINARY_FOLDERS.PROFILE, "image");
    user.profilePicture = url;
    await user.save();
    return user;
  }

  async updateCoverPicture(userId: string, filePath: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);

    const { url } = await uploadToCloudinary(filePath, CLOUDINARY_FOLDERS.COVER, "image");
    user.coverPicture = url;
    await user.save();
    return user;
  }

  async softDeleteAccount(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);
    user.isDeleted = true; // Hook cascades posts & comments
    await user.save();
    return { message: "Account deleted successfully" };
  }

  async hardDeleteAccount(userId: string) {
    // Admin only - hard delete everything
    await UserModel.findByIdAndDelete(userId);
    await PostModel.deleteMany({ userId });
    await RequestModel.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });
    return { message: "Account permanently deleted" };
  }

  async searchUsers(query: string, page = 1, limit = 10) {
    const { skip } = paginate(page, limit);
    const users = await UserModel.find({
      isDeleted: false,
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("firstName lastName username profilePicture isOnline bio")
      .skip(skip)
      .limit(limit);

    const total = await UserModel.countDocuments({ isDeleted: false, $or: [
      { firstName: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
    ]});

    return { users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getFriends(userId: string) {
    const user = await UserModel.findById(userId)
      .populate("friends", "firstName lastName username profilePicture isOnline lastSeen");
    if (!user) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return user.friends;
  }

  async getMutualFriends(userId: string, targetUserId: string) {
    const [user, target] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(targetUserId),
    ]);
    if (!user || !target) throw new AppError(MESSAGES.NOT_FOUND, 404);

    const userFriendIds = user.friends.map((f) => f.toString());
    const targetFriendIds = target.friends.map((f) => f.toString());
    const mutualIds = userFriendIds.filter((id) => targetFriendIds.includes(id));

    const mutual = await UserModel.find({ _id: { $in: mutualIds } })
      .select("firstName lastName username profilePicture");
    return mutual;
  }

  // Dashboard stats (admin)
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      deletedUsers,
      totalPosts,
      totalDeletedPosts,
    ] = await Promise.all([
      UserModel.countDocuments({}),
      UserModel.countDocuments({ isDeleted: false, isConfirmed: true }),
      UserModel.countDocuments({ isDeleted: true }),
      PostModel.countDocuments({ isDeleted: false }),
      PostModel.countDocuments({ isDeleted: true }),
    ]);

    const newUsersThisMonth = await UserModel.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    });

    return {
      totalUsers,
      activeUsers,
      deletedUsers,
      totalPosts,
      totalDeletedPosts,
      newUsersThisMonth,
    };
  }

  async getAllUsers(page = 1, limit = 10) {
    const { skip } = paginate(page, limit);
    const [users, total] = await Promise.all([
      UserModel.find().select("-password -confirmationCode -resetPasswordCode").skip(skip).limit(limit),
      UserModel.countDocuments(),
    ]);
    return { users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getProfilePosts(profileUserId: string, requesterId: string, page = 1, limit = 10) {
    const { skip } = paginate(page, limit);
    const isOwner = profileUserId === requesterId;

    const profile = await UserModel.findById(profileUserId);
    if (!profile || profile.isDeleted) throw new AppError(MESSAGES.NOT_FOUND, 404);

    const isFriend = profile.friends.map(f => f.toString()).includes(requesterId);

    let privacyFilter: any = { privacy: PostPrivacy.PUBLIC };
    if (isOwner) privacyFilter = {};
    else if (isFriend) privacyFilter = { privacy: { $in: [PostPrivacy.PUBLIC, PostPrivacy.FRIENDS] } };

    const [posts, total] = await Promise.all([
      PostModel.find({ userId: profileUserId, isDeleted: false, ...privacyFilter })
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName username profilePicture"),
      PostModel.countDocuments({ userId: profileUserId, isDeleted: false, ...privacyFilter }),
    ]);

    return { posts, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
