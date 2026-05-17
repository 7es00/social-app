import { Response } from "express";
import { ApiResponse } from "../types";

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: ApiResponse["meta"]
): Response => {
  const response: ApiResponse<T> = {
    success: statusCode < 400,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(response);
};

export const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

export const generateCode = (length = 6): string => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
};

export const isExpired = (date: Date): boolean => {
  return new Date() > date;
};
