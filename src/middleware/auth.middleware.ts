import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../common/types";
import { UserModel } from "../DB";
import { config } from "../config";
import { MESSAGES } from "../common/constant";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: MESSAGES.UNAUTHORIZED });
      return;
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: MESSAGES.UNAUTHORIZED });
      return;
    }
    if (user.isDeleted) {
      res.status(403).json({ success: false, message: MESSAGES.ACCOUNT_DELETED });
      return;
    }
    if (!user.isConfirmed) {
      res.status(403).json({ success: false, message: MESSAGES.ACCOUNT_NOT_CONFIRMED });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: MESSAGES.TOKEN_INVALID });
  }
};

export const authorize = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: MESSAGES.FORBIDDEN });
      return;
    }
    next();
  };
