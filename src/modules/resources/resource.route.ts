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
import { ResourceModel } from "./resource.model";

const resourceTypeSchema = z.enum([
  "notes",
  "suggestions",
  "short_questions",
  "important_topics",
  "model_questions"
]);

const resourceBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  resourceType: resourceTypeSchema,
  courseId: objectIdSchema,
  departmentId: objectIdSchema,
  academicYearId: objectIdSchema,
  subjectId: objectIdSchema.optional(),
  description: z.string().min(1),
  fileIds: z.array(objectIdSchema).optional(),
  isVerified: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.coerce.date().optional()
});

const resourceQuerySchema = paginationQuerySchema.extend({
  courseId: objectIdSchema.optional(),
  departmentId: objectIdSchema.optional(),
  academicYearId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  resourceType: resourceTypeSchema.optional(),
  isVerified: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional()
});

const resourcePopulate = [
  { path: "courseId", select: "name slug" },
  { path: "departmentId", select: "name slug" },
  { path: "academicYearId", select: "name slug" },
  { path: "subjectId", select: "title code slug" },
  { path: "fileIds", select: "originalName filename url mimeType size" }
];

const buildResourceFilters = (query: Record<string, unknown>, includePublished?: boolean) => ({
  ...(includePublished ? { isPublished: true } : {}),
  ...(query.courseId ? { courseId: query.courseId } : {}),
  ...(query.departmentId ? { departmentId: query.departmentId } : {}),
  ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
  ...(query.subjectId ? { subjectId: query.subjectId } : {}),
  ...(query.resourceType ? { resourceType: query.resourceType } : {}),
  ...(parseBoolean(query.isVerified) !== undefined ? { isVerified: parseBoolean(query.isVerified) } : {}),
  ...(parseBoolean(query.isPublished) !== undefined ? { isPublished: parseBoolean(query.isPublished) } : {}),
  ...(buildSearchFilter(query.search, ["title", "description", "slug"]) ?? {})
});

export const resourceRouter = Router();

resourceRouter.get(
  "/",
  validateRequest({ query: resourceQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: ResourceModel,
      message: "Resources fetched successfully",
      populate: resourcePopulate,
      filterBuilder: () => buildResourceFilters(req.query as Record<string, unknown>, true)
    });
  })
);

resourceRouter.get(
  "/:slug",
  validateRequest({ params: slugParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentBySlug(
      res,
      ResourceModel,
      getParamValue(req.params.slug),
      "Resource fetched successfully",
      { isPublished: true },
      resourcePopulate
    );
  })
);

export const adminResourceRouter = Router();

adminResourceRouter.use(requireAuth("admin", "super_admin"));

adminResourceRouter.get(
  "/",
  validateRequest({ query: resourceQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: ResourceModel,
      message: "Resources fetched successfully",
      populate: resourcePopulate,
      filterBuilder: () => buildResourceFilters(req.query as Record<string, unknown>)
    });
  })
);

adminResourceRouter.post(
  "/",
  validateRequest({ body: resourceBodySchema }),
  catchAsync(async (req, res) => {
    await createDocument(res, ResourceModel, req.body, "Resource created successfully");
  })
);

adminResourceRouter.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentById(
      res,
      ResourceModel,
      getParamValue(req.params.id),
      "Resource fetched successfully",
      resourcePopulate
    );
  })
);

adminResourceRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: resourceBodySchema.partial() }),
  catchAsync(async (req, res) => {
    await updateDocument(
      res,
      ResourceModel,
      getParamValue(req.params.id),
      req.body,
      "Resource updated successfully"
    );
  })
);

adminResourceRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await deleteDocument(res, ResourceModel, getParamValue(req.params.id), "Resource deleted successfully");
  })
);
