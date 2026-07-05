import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

type ValidationSchemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

const replaceObjectValues = (target: Record<string, unknown>, source: Record<string, unknown>) => {
  for (const key of Object.keys(target)) {
    delete target[key];
  }

  Object.assign(target, source);
};

export const validateRequest =
  (schemas: ValidationSchemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) {
      const parsedBody = schemas.body.parse(req.body) as Record<string, unknown>;
      if (req.body && typeof req.body === "object") {
        replaceObjectValues(req.body as Record<string, unknown>, parsedBody);
      } else {
        req.body = parsedBody as Request["body"];
      }
    }

    if (schemas.query) {
      const parsedQuery = schemas.query.parse(req.query) as Record<string, unknown>;
      replaceObjectValues(req.query as Record<string, unknown>, parsedQuery);
    }

    if (schemas.params) {
      const parsedParams = schemas.params.parse(req.params) as Record<string, unknown>;
      replaceObjectValues(req.params as Record<string, unknown>, parsedParams);
    }

    next();
  };
