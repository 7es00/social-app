import { Request } from "express";
import { IUser } from "../interfaces";
import { Types } from "mongoose";

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ObjectId = Types.ObjectId;
