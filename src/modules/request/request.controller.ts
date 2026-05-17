import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types";
import { RequestService } from "./request.service";
import { sendResponse } from "../../common/utils";
import { MESSAGES } from "../../common/constant";

const requestService = new RequestService();

export const sendFriendRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const request = await requestService.sendFriendRequest(req.user!._id.toString(), req.params.userId);
    sendResponse(res, 201, "Friend request sent", request);
  } catch (e) { next(e); }
};

export const acceptRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const request = await requestService.respondToRequest(req.params.requestId, req.user!._id.toString(), "accept");
    sendResponse(res, 200, "Friend request accepted", request);
  } catch (e) { next(e); }
};

export const rejectRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const request = await requestService.respondToRequest(req.params.requestId, req.user!._id.toString(), "reject");
    sendResponse(res, 200, "Friend request rejected", request);
  } catch (e) { next(e); }
};

export const cancelRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.cancelRequest(req.user!._id.toString(), req.params.requestId);
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const unfriend = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.unfriend(req.user!._id.toString(), req.params.userId);
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const blockUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.blockUser(req.user!._id.toString(), req.params.userId);
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const unblockUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.unblockUser(req.user!._id.toString(), req.params.userId);
    sendResponse(res, 200, result.message);
  } catch (e) { next(e); }
};

export const getPendingRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requests = await requestService.getPendingRequests(req.user!._id.toString());
    sendResponse(res, 200, MESSAGES.FETCHED, requests);
  } catch (e) { next(e); }
};

export const getSentRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requests = await requestService.getSentRequests(req.user!._id.toString());
    sendResponse(res, 200, MESSAGES.FETCHED, requests);
  } catch (e) { next(e); }
};
