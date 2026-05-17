import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types";
import { ReactionService } from "./reaction.service";
import { sendResponse } from "../../common/utils";
import { MESSAGES } from "../../common/constant";
import { ReactionType } from "../../common/enums";

const reactionService = new ReactionService();

export const reactToPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await reactionService.reactToPost(
      req.user!._id.toString(),
      req.params.postId,
      req.body.type as ReactionType
    );
    sendResponse(res, 200, result.message, result.reaction);
  } catch (e) { next(e); }
};

export const reactToComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await reactionService.reactToComment(
      req.user!._id.toString(),
      req.params.commentId,
      req.body.type as ReactionType
    );
    sendResponse(res, 200, result.message, result.reaction);
  } catch (e) { next(e); }
};

export const getPostReactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await reactionService.getPostReactions(req.params.postId);
    sendResponse(res, 200, MESSAGES.FETCHED, result);
  } catch (e) { next(e); }
};

export const getCommentReactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await reactionService.getCommentReactions(req.params.commentId);
    sendResponse(res, 200, MESSAGES.FETCHED, result);
  } catch (e) { next(e); }
};
