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
import { CourseModel } from "./course.model";

const courseBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional()
});

const courseQuerySchema = paginationQuerySchema.extend({
  isActive: z.coerce.boolean().optional()
});

export const courseRouter = Router();

courseRouter.get(
  "/",
  validateRequest({ query: courseQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: CourseModel,
      message: "Courses fetched successfully",
      baseFilter: { isActive: true },
      sort: { order: 1, createdAt: -1 },
      filterBuilder: () => buildSearchFilter(req.query.search, ["name", "slug"]) ?? {}
    });
  })
);

export const adminCourseRouter = Router();

adminCourseRouter.use(requireAuth("admin", "super_admin"));

adminCourseRouter.get(
  "/",
  validateRequest({ query: courseQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: CourseModel,
      message: "Courses fetched successfully",
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

adminCourseRouter.post(
  "/",
  validateRequest({ body: courseBodySchema }),
  catchAsync(async (req, res) => {
    await createDocument(res, CourseModel, req.body, "Course created successfully");
  })
);

adminCourseRouter.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentById(res, CourseModel, getParamValue(req.params.id), "Course fetched successfully");
  })
);

adminCourseRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: courseBodySchema.partial() }),
  catchAsync(async (req, res) => {
    await updateDocument(
      res,
      CourseModel,
      getParamValue(req.params.id),
      req.body,
      "Course updated successfully"
    );
  })
);

adminCourseRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await deleteDocument(res, CourseModel, getParamValue(req.params.id), "Course deleted successfully");
  })
);
