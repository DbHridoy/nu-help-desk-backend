import type { JwtPayload } from "../modules/auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      admin?: JwtPayload;
    }
  }
}

export {};
