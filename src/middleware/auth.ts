import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http-status";
import { AdminModel } from "../modules/admins/admin.model";
import { AppError } from "../utils/AppError";
import { verifyJwt } from "../utils/jwt";

export const requireAuth =
  (...roles: Array<"admin" | "super_admin">) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      next(new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const token = authHeader.slice(7);
    const decoded = verifyJwt(token);
    const admin = await AdminModel.findById(decoded.adminId);

    if (!admin || !admin.isActive) {
      next(new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    if (roles.length > 0 && !roles.includes(admin.role)) {
      next(new AppError("Forbidden", HTTP_STATUS.FORBIDDEN));
      return;
    }

    req.admin = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role
    };

    next();
  };
