import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types";
import { StoryService } from "./story.service";
import { sendResponse } from "../../common/utils";
import { MESSAGES } from "../../common/constant";

const storyService = new StoryService();

export const createStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: "Media file required" }); return; }
    const story = await storyService.createStory(req.user!._id.toString(), req.file, req.body.text);
    sendResponse(res, 201, MESSAGES.CREATED, story);
  } catch (e) { next(e); }
};

export const getFriendsStories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stories = await storyService.getFriendsStories(req.user!._id.toString());
    sendResponse(res, 200, MESSAGES.FETCHED, stories);
  } catch (e) { next(e); }
};

export const viewStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const story = await storyService.viewStory(req.params.storyId, req.user!._id.toString());
    sendResponse(res, 200, MESSAGES.UPDATED, story);
  } catch (e) { next(e); }
};

export const getMyStories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stories = await storyService.getMyStories(req.user!._id.toString());
    sendResponse(res, 200, MESSAGES.FETCHED, stories);
  } catch (e) { next(e); }
};

export const getStoryViewers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const story = await storyService.getStoryViewers(req.params.storyId, req.user!._id.toString());
    sendResponse(res, 200, MESSAGES.FETCHED, story);
  } catch (e) { next(e); }
};

export const deleteStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await storyService.deleteStory(
      req.params.storyId,
      req.user!._id.toString(),
      req.user!.role
    );
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};
