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
import { QuestionPaperModel } from "./question.model";

const questionBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  courseId: objectIdSchema,
  departmentId: objectIdSchema,
  academicYearId: objectIdSchema,
  subjectId: objectIdSchema,
  examYear: z.coerce.number().int().min(1900),
  description: z.string().min(1),
  fileIds: z.array(objectIdSchema).optional(),
  isVerified: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.coerce.date().optional()
});

const questionQuerySchema = paginationQuerySchema.extend({
  courseId: objectIdSchema.optional(),
  departmentId: objectIdSchema.optional(),
  academicYearId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  examYear: z.coerce.number().int().optional(),
  isVerified: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional()
});

const questionPopulate = [
  { path: "courseId", select: "name slug" },
  { path: "departmentId", select: "name slug" },
  { path: "academicYearId", select: "name slug" },
  { path: "subjectId", select: "title code slug" },
  { path: "fileIds", select: "originalName filename url mimeType size" }
];

const buildQuestionFilters = (query: Record<string, unknown>, includePublished?: boolean) => ({
  ...(includePublished ? { isPublished: true } : {}),
  ...(query.courseId ? { courseId: query.courseId } : {}),
  ...(query.departmentId ? { departmentId: query.departmentId } : {}),
  ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
  ...(query.subjectId ? { subjectId: query.subjectId } : {}),
  ...(query.examYear ? { examYear: Number(query.examYear) } : {}),
  ...(parseBoolean(query.isVerified) !== undefined ? { isVerified: parseBoolean(query.isVerified) } : {}),
  ...(parseBoolean(query.isPublished) !== undefined ? { isPublished: parseBoolean(query.isPublished) } : {}),
  ...(buildSearchFilter(query.search, ["title", "description", "slug"]) ?? {})
});

export const questionRouter = Router();

questionRouter.get(
  "/",
  validateRequest({ query: questionQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: QuestionPaperModel,
      message: "Question papers fetched successfully",
      populate: questionPopulate,
      filterBuilder: () => buildQuestionFilters(req.query as Record<string, unknown>, true)
    });
  })
);

questionRouter.get(
  "/:slug",
  validateRequest({ params: slugParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentBySlug(
      res,
      QuestionPaperModel,
      getParamValue(req.params.slug),
      "Question paper fetched successfully",
      { isPublished: true },
      questionPopulate
    );
  })
);

export const adminQuestionRouter = Router();

adminQuestionRouter.use(requireAuth("admin", "super_admin"));

adminQuestionRouter.get(
  "/",
  validateRequest({ query: questionQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: QuestionPaperModel,
      message: "Question papers fetched successfully",
      populate: questionPopulate,
      filterBuilder: () => buildQuestionFilters(req.query as Record<string, unknown>)
    });
  })
);

adminQuestionRouter.post(
  "/",
  validateRequest({ body: questionBodySchema }),
  catchAsync(async (req, res) => {
    await createDocument(res, QuestionPaperModel, req.body, "Question paper created successfully");
  })
);

adminQuestionRouter.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentById(
      res,
      QuestionPaperModel,
      getParamValue(req.params.id),
      "Question paper fetched successfully",
      questionPopulate
    );
  })
);

adminQuestionRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: questionBodySchema.partial() }),
  catchAsync(async (req, res) => {
    await updateDocument(
      res,
      QuestionPaperModel,
      getParamValue(req.params.id),
      req.body,
      "Question paper updated successfully"
    );
  })
);

adminQuestionRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await deleteDocument(
      res,
      QuestionPaperModel,
      getParamValue(req.params.id),
      "Question paper deleted successfully"
    );
  })
);
