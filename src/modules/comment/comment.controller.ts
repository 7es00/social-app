import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types";
import { CommentService } from "./comment.service";
import { sendResponse } from "../../common/utils";
import { MESSAGES } from "../../common/constant";

const commentService = new CommentService();

export const createComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const comment = await commentService.createComment(
      req.params.postId,
      req.user!._id.toString(),
      req.body,
      req.file
    );
    sendResponse(res, 201, MESSAGES.CREATED, comment);
  } catch (e) { next(e); }
};

export const getPostComments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as any;
    const result = await commentService.getPostComments(req.params.postId, +page || 1, +limit || 10);
    sendResponse(res, 200, MESSAGES.FETCHED, result.comments, result.meta);
  } catch (e) { next(e); }
};

export const getCommentReplies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as any;
    const result = await commentService.getCommentReplies(req.params.commentId, +page || 1, +limit || 10);
    sendResponse(res, 200, MESSAGES.FETCHED, result.replies, result.meta);
  } catch (e) { next(e); }
};

export const updateComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const comment = await commentService.updateComment(
      req.params.commentId,
      req.user!._id.toString(),
      req.body.content
    );
    sendResponse(res, 200, MESSAGES.UPDATED, comment);
  } catch (e) { next(e); }
};

export const softDeleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await commentService.softDeleteComment(
      req.params.commentId,
      req.user!._id.toString(),
      req.user!.role
    );
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const hardDeleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await commentService.hardDeleteComment(
      req.params.commentId,
      req.user!._id.toString(),
      req.user!.role
    );
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};
