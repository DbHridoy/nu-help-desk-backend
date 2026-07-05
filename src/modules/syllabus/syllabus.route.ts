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
import { SyllabusModel } from "./syllabus.model";

const syllabusBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  courseId: objectIdSchema,
  departmentId: objectIdSchema,
  academicYearId: objectIdSchema,
  subjectId: objectIdSchema.optional(),
  subjectCode: z.string().optional(),
  subjectTitle: z.string().optional(),
  description: z.string().min(1),
  fileIds: z.array(objectIdSchema).optional(),
  isVerified: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.coerce.date().optional()
});

const syllabusQuerySchema = paginationQuerySchema.extend({
  courseId: objectIdSchema.optional(),
  departmentId: objectIdSchema.optional(),
  academicYearId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  isVerified: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional()
});

const syllabusPopulate = [
  { path: "courseId", select: "name slug" },
  { path: "departmentId", select: "name slug" },
  { path: "academicYearId", select: "name slug" },
  { path: "subjectId", select: "title code slug" },
  { path: "fileIds", select: "originalName filename url mimeType size" }
];

const buildSyllabusFilters = (query: Record<string, unknown>, includePublished?: boolean) => ({
  ...(includePublished ? { isPublished: true } : {}),
  ...(query.courseId ? { courseId: query.courseId } : {}),
  ...(query.departmentId ? { departmentId: query.departmentId } : {}),
  ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
  ...(query.subjectId ? { subjectId: query.subjectId } : {}),
  ...(parseBoolean(query.isVerified) !== undefined ? { isVerified: parseBoolean(query.isVerified) } : {}),
  ...(parseBoolean(query.isPublished) !== undefined ? { isPublished: parseBoolean(query.isPublished) } : {}),
  ...(buildSearchFilter(query.search, ["title", "description", "subjectCode", "subjectTitle", "slug"]) ?? {})
});

export const syllabusRouter = Router();

syllabusRouter.get(
  "/",
  validateRequest({ query: syllabusQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: SyllabusModel,
      message: "Syllabus fetched successfully",
      populate: syllabusPopulate,
      filterBuilder: () => buildSyllabusFilters(req.query as Record<string, unknown>, true)
    });
  })
);

syllabusRouter.get(
  "/:slug",
  validateRequest({ params: slugParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentBySlug(
      res,
      SyllabusModel,
      getParamValue(req.params.slug),
      "Syllabus fetched successfully",
      { isPublished: true },
      syllabusPopulate
    );
  })
);

export const adminSyllabusRouter = Router();

adminSyllabusRouter.use(requireAuth("admin", "super_admin"));

adminSyllabusRouter.get(
  "/",
  validateRequest({ query: syllabusQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: SyllabusModel,
      message: "Syllabus fetched successfully",
      populate: syllabusPopulate,
      filterBuilder: () => buildSyllabusFilters(req.query as Record<string, unknown>)
    });
  })
);

adminSyllabusRouter.post(
  "/",
  validateRequest({ body: syllabusBodySchema }),
  catchAsync(async (req, res) => {
    await createDocument(res, SyllabusModel, req.body, "Syllabus created successfully");
  })
);

adminSyllabusRouter.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentById(
      res,
      SyllabusModel,
      getParamValue(req.params.id),
      "Syllabus fetched successfully",
      syllabusPopulate
    );
  })
);

adminSyllabusRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: syllabusBodySchema.partial() }),
  catchAsync(async (req, res) => {
    await updateDocument(
      res,
      SyllabusModel,
      getParamValue(req.params.id),
      req.body,
      "Syllabus updated successfully"
    );
  })
);

adminSyllabusRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await deleteDocument(res, SyllabusModel, getParamValue(req.params.id), "Syllabus deleted successfully");
  })
);
