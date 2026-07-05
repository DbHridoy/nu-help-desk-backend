import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

type ValidationSchemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export const validateRequest =
  (schemas: ValidationSchemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body) as Request["body"];
    }

    if (schemas.query) {
      req.query = schemas.query.parse(req.query) as Request["query"];
    }

    if (schemas.params) {
      req.params = schemas.params.parse(req.params) as Request["params"];
    }

    next();
  };
