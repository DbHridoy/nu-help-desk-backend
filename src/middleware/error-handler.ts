import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "../utils/AppError";
import { sendResponse } from "../utils/sendResponse";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof ZodError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json(
      sendResponse({
        success: false,
        message: "Validation failed",
        data: error.flatten()
      })
    );
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json(
      sendResponse({
        success: false,
        message: error.message,
        data: null
      })
    );
    return;
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
    sendResponse({
      success: false,
      message: error.message || "Internal server error",
      data: null
    })
  );
};
