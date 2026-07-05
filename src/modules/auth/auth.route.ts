import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validate-request";
import { HTTP_STATUS } from "../../constants/http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { comparePassword } from "../../utils/password";
import { sendResponse } from "../../utils/sendResponse";
import { signJwt } from "../../utils/jwt";
import { AdminModel } from "../admins/admin.model";
import { adminLoginSchema } from "./auth.validation";

export const authRouter = Router();

authRouter.post(
  "/login",
  validateRequest({ body: adminLoginSchema }),
  catchAsync(async (req, res) => {
    const admin = await AdminModel.findOne({ email: req.body.email.toLowerCase() });

    if (!admin || !(await comparePassword(req.body.password, admin.passwordHash))) {
      throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
    }

    if (!admin.isActive) {
      throw new AppError("Admin account is inactive", HTTP_STATUS.FORBIDDEN);
    }

    const token = signJwt({
      adminId: admin.id,
      email: admin.email,
      role: admin.role
    });

    res.status(HTTP_STATUS.OK).json(
      sendResponse({
        success: true,
        message: "Admin login successful",
        data: {
          token,
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive
          }
        }
      })
    );
  })
);

authRouter.get(
  "/me",
  requireAuth("admin", "super_admin"),
  catchAsync(async (req, res) => {
    const admin = await AdminModel.findById(req.admin?.adminId).select("-passwordHash");

    res.status(HTTP_STATUS.OK).json(
      sendResponse({
        success: true,
        message: "Admin profile fetched successfully",
        data: admin
      })
    );
  })
);
