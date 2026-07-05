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
import { NoticeModel } from "./notice.model";

const noticeBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  category: z.enum([
    "exam_notice",
    "form_fill_up",
    "routine",
    "result",
    "admit_card",
    "syllabus_update",
    "general_notice"
  ]),
  courseId: objectIdSchema.optional(),
  departmentId: objectIdSchema.optional(),
  academicYearId: objectIdSchema.optional(),
  description: z.string().min(1),
  officialSourceLink: z.string().url().optional(),
  fileIds: z.array(objectIdSchema).optional(),
  isVerified: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
  noticeDate: z.coerce.date()
});

const noticeQuerySchema = paginationQuerySchema.extend({
  courseId: objectIdSchema.optional(),
  departmentId: objectIdSchema.optional(),
  academicYearId: objectIdSchema.optional(),
  category: noticeBodySchema.shape.category.optional(),
  isVerified: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional()
});

const noticePopulate = [
  { path: "courseId", select: "name slug" },
  { path: "departmentId", select: "name slug" },
  { path: "academicYearId", select: "name slug" },
  { path: "fileIds", select: "originalName filename url mimeType size" }
];

const buildNoticeFilters = (query: Record<string, unknown>, includePublished?: boolean) => ({
  ...(includePublished ? { isPublished: true } : {}),
  ...(query.courseId ? { courseId: query.courseId } : {}),
  ...(query.departmentId ? { departmentId: query.departmentId } : {}),
  ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
  ...(query.category ? { category: query.category } : {}),
  ...(parseBoolean(query.isVerified) !== undefined ? { isVerified: parseBoolean(query.isVerified) } : {}),
  ...(parseBoolean(query.isPublished) !== undefined ? { isPublished: parseBoolean(query.isPublished) } : {}),
  ...(buildSearchFilter(query.search, ["title", "description", "slug"]) ?? {})
});

export const noticeRouter = Router();

noticeRouter.get(
  "/",
  validateRequest({ query: noticeQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: NoticeModel,
      message: "Notices fetched successfully",
      populate: noticePopulate,
      sort: { noticeDate: -1, createdAt: -1 },
      filterBuilder: () => buildNoticeFilters(req.query as Record<string, unknown>, true)
    });
  })
);

noticeRouter.get(
  "/:slug",
  validateRequest({ params: slugParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentBySlug(
      res,
      NoticeModel,
      getParamValue(req.params.slug),
      "Notice fetched successfully",
      { isPublished: true },
      noticePopulate
    );
  })
);

export const adminNoticeRouter = Router();

adminNoticeRouter.use(requireAuth("admin", "super_admin"));

adminNoticeRouter.get(
  "/",
  validateRequest({ query: noticeQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: NoticeModel,
      message: "Notices fetched successfully",
      populate: noticePopulate,
      sort: { noticeDate: -1, createdAt: -1 },
      filterBuilder: () => buildNoticeFilters(req.query as Record<string, unknown>)
    });
  })
);

adminNoticeRouter.post(
  "/",
  validateRequest({ body: noticeBodySchema }),
  catchAsync(async (req, res) => {
    await createDocument(res, NoticeModel, req.body, "Notice created successfully");
  })
);

adminNoticeRouter.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentById(
      res,
      NoticeModel,
      getParamValue(req.params.id),
      "Notice fetched successfully",
      noticePopulate
    );
  })
);

adminNoticeRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: noticeBodySchema.partial() }),
  catchAsync(async (req, res) => {
    await updateDocument(
      res,
      NoticeModel,
      getParamValue(req.params.id),
      req.body,
      "Notice updated successfully"
    );
  })
);

adminNoticeRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await deleteDocument(res, NoticeModel, getParamValue(req.params.id), "Notice deleted successfully");
  })
);
