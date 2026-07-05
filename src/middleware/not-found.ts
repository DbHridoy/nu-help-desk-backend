import type { Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http-status";
import { sendResponse } from "../utils/sendResponse";

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json(
    sendResponse({
      success: false,
      message: "Route not found",
      data: null
    })
  );
};
