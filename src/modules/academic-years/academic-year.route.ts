import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validate-request";
import { catchAsync } from "../../utils/catchAsync";
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getParamValue,
  listDocuments,
  updateDocument
} from "../../utils/crud";
import { buildSearchFilter, parseBoolean } from "../../utils/query";
import { idParamSchema, paginationQuerySchema } from "../../utils/validation";
import { AcademicYearModel } from "./academic-year.model";

const academicYearBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional()
});

const academicYearQuerySchema = paginationQuerySchema.extend({
  isActive: z.coerce.boolean().optional()
});

export const academicYearRouter = Router();

academicYearRouter.get(
  "/",
  validateRequest({ query: academicYearQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: AcademicYearModel,
      message: "Academic years fetched successfully",
      baseFilter: { isActive: true },
      sort: { order: 1, createdAt: -1 },
      filterBuilder: () => buildSearchFilter(req.query.search, ["name", "slug"]) ?? {}
    });
  })
);

export const adminAcademicYearRouter = Router();

adminAcademicYearRouter.use(requireAuth("admin", "super_admin"));

adminAcademicYearRouter.get(
  "/",
  validateRequest({ query: academicYearQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: AcademicYearModel,
      message: "Academic years fetched successfully",
      sort: { order: 1, createdAt: -1 },
      filterBuilder: () => ({
        ...(parseBoolean(req.query.isActive) !== undefined
          ? { isActive: parseBoolean(req.query.isActive) }
          : {}),
        ...(buildSearchFilter(req.query.search, ["name", "slug"]) ?? {})
      })
    });
  })
);

adminAcademicYearRouter.post(
  "/",
  validateRequest({ body: academicYearBodySchema }),
  catchAsync(async (req, res) => {
    await createDocument(res, AcademicYearModel, req.body, "Academic year created successfully");
  })
);

adminAcademicYearRouter.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentById(
      res,
      AcademicYearModel,
      getParamValue(req.params.id),
      "Academic year fetched successfully"
    );
  })
);

adminAcademicYearRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: academicYearBodySchema.partial() }),
  catchAsync(async (req, res) => {
    await updateDocument(
      res,
      AcademicYearModel,
      getParamValue(req.params.id),
      req.body,
      "Academic year updated successfully"
    );
  })
);

adminAcademicYearRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await deleteDocument(
      res,
      AcademicYearModel,
      getParamValue(req.params.id),
      "Academic year deleted successfully"
    );
  })
);
