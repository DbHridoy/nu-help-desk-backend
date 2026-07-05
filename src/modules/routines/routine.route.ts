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
  getDocumentBySlug,
  listDocuments,
  updateDocument
} from "../../utils/crud";
import { buildSearchFilter, parseBoolean } from "../../utils/query";
import {
  idParamSchema,
  objectIdSchema,
  paginationQuerySchema,
  slugParamSchema
} from "../../utils/validation";
import { RoutineModel } from "./routine.model";

const routineBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  courseId: objectIdSchema,
  departmentId: objectIdSchema.optional(),
  academicYearId: objectIdSchema,
  examType: z.string().min(1),
  description: z.string().min(1),
  examStartDate: z.coerce.date(),
  examEndDate: z.coerce.date(),
  fileIds: z.array(objectIdSchema).optional(),
  isVerified: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.coerce.date().optional()
});

const routineQuerySchema = paginationQuerySchema.extend({
  courseId: objectIdSchema.optional(),
  departmentId: objectIdSchema.optional(),
  academicYearId: objectIdSchema.optional(),
  isVerified: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional()
});

const routinePopulate = [
  { path: "courseId", select: "name slug" },
  { path: "departmentId", select: "name slug" },
  { path: "academicYearId", select: "name slug" },
  { path: "fileIds", select: "originalName filename url mimeType size" }
];

const buildRoutineFilters = (query: Record<string, unknown>, includePublished?: boolean) => ({
  ...(includePublished ? { isPublished: true } : {}),
  ...(query.courseId ? { courseId: query.courseId } : {}),
  ...(query.departmentId ? { departmentId: query.departmentId } : {}),
  ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
  ...(parseBoolean(query.isVerified) !== undefined ? { isVerified: parseBoolean(query.isVerified) } : {}),
  ...(parseBoolean(query.isPublished) !== undefined ? { isPublished: parseBoolean(query.isPublished) } : {}),
  ...(buildSearchFilter(query.search, ["title", "description", "examType", "slug"]) ?? {})
});

export const routineRouter = Router();

routineRouter.get(
  "/",
  validateRequest({ query: routineQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: RoutineModel,
      message: "Routines fetched successfully",
      populate: routinePopulate,
      filterBuilder: () => buildRoutineFilters(req.query as Record<string, unknown>, true)
    });
  })
);

routineRouter.get(
  "/:slug",
  validateRequest({ params: slugParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentBySlug(
      res,
      RoutineModel,
      getParamValue(req.params.slug),
      "Routine fetched successfully",
      { isPublished: true },
      routinePopulate
    );
  })
);

export const adminRoutineRouter = Router();

adminRoutineRouter.use(requireAuth("admin", "super_admin"));

adminRoutineRouter.get(
  "/",
  validateRequest({ query: routineQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: RoutineModel,
      message: "Routines fetched successfully",
      populate: routinePopulate,
      filterBuilder: () => buildRoutineFilters(req.query as Record<string, unknown>)
    });
  })
);

adminRoutineRouter.post(
  "/",
  validateRequest({ body: routineBodySchema }),
  catchAsync(async (req, res) => {
    await createDocument(res, RoutineModel, req.body, "Routine created successfully");
  })
);

adminRoutineRouter.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentById(
      res,
      RoutineModel,
      getParamValue(req.params.id),
      "Routine fetched successfully",
      routinePopulate
    );
  })
);

adminRoutineRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: routineBodySchema.partial() }),
  catchAsync(async (req, res) => {
    await updateDocument(
      res,
      RoutineModel,
      getParamValue(req.params.id),
      req.body,
      "Routine updated successfully"
    );
  })
);

adminRoutineRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await deleteDocument(res, RoutineModel, getParamValue(req.params.id), "Routine deleted successfully");
  })
);
