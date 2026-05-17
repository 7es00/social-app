import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types";
import { PostService } from "./post.service";
import { sendResponse } from "../../common/utils";
import { MESSAGES } from "../../common/constant";
import { UserRole } from "../../common/enums";

const postService = new PostService();

export const createPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    const post = await postService.createPost(req.user!._id.toString(), req.body, files);
    sendResponse(res, 201, MESSAGES.CREATED, post);
  } catch (e) { next(e); }
};

export const getPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await postService.getPost(req.params.postId, req.user!._id.toString());
    sendResponse(res, 200, MESSAGES.FETCHED, post);
  } catch (e) { next(e); }
};

export const updatePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await postService.updatePost(req.params.postId, req.user!._id.toString(), req.body);
    sendResponse(res, 200, MESSAGES.UPDATED, post);
  } catch (e) { next(e); }
};

export const softDeletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await postService.softDeletePost(
      req.params.postId,
      req.user!._id.toString(),
      req.user!.role
    );
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const hardDeletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await postService.hardDeletePost(
      req.params.postId,
      req.user!._id.toString(),
      req.user!.role
    );
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const getNewsFeed = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as any;
    const result = await postService.getNewsFeed(req.user!._id.toString(), +page || 1, +limit || 10);
    sendResponse(res, 200, MESSAGES.FETCHED, result.posts, result.meta);
  } catch (e) { next(e); }
};

export const pinPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await postService.pinPost(req.params.postId, req.user!._id.toString());
    sendResponse(res, 200, MESSAGES.UPDATED, post);
  } catch (e) { next(e); }
};

export const sharePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await postService.sharePost(
      req.params.postId,
      req.user!._id.toString(),
      req.body.content
    );
    sendResponse(res, 201, MESSAGES.CREATED, post);
  } catch (e) { next(e); }
};

export const getAllPostsAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, includeDeleted } = req.query as any;
    const result = await postService.getAllPostsAdmin(+page || 1, +limit || 10, includeDeleted === "true");
    sendResponse(res, 200, MESSAGES.FETCHED, result.posts, result.meta);
  } catch (e) { next(e); }
};
