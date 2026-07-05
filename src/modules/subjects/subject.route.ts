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
import { idParamSchema, objectIdSchema, paginationQuerySchema } from "../../utils/validation";
import { SubjectModel } from "./subject.model";

const subjectBodySchema = z.object({
  courseId: objectIdSchema,
  departmentId: objectIdSchema,
  academicYearId: objectIdSchema,
  title: z.string().min(1),
  code: z.string().min(1),
  slug: z.string().min(1).optional(),
  isActive: z.boolean().optional()
});

const subjectQuerySchema = paginationQuerySchema.extend({
  courseId: objectIdSchema.optional(),
  departmentId: objectIdSchema.optional(),
  academicYearId: objectIdSchema.optional(),
  isActive: z.coerce.boolean().optional()
});

const subjectPopulate = [
  { path: "courseId", select: "name slug" },
  { path: "departmentId", select: "name slug" },
  { path: "academicYearId", select: "name slug" }
];

export const subjectRouter = Router();

subjectRouter.get(
  "/",
  validateRequest({ query: subjectQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: SubjectModel,
      message: "Subjects fetched successfully",
      baseFilter: { isActive: true },
      populate: subjectPopulate,
      filterBuilder: () => ({
        ...(req.query.courseId ? { courseId: req.query.courseId } : {}),
        ...(req.query.departmentId ? { departmentId: req.query.departmentId } : {}),
        ...(req.query.academicYearId ? { academicYearId: req.query.academicYearId } : {}),
        ...(buildSearchFilter(req.query.search, ["title", "code", "slug"]) ?? {})
      })
    });
  })
);

export const adminSubjectRouter = Router();

adminSubjectRouter.use(requireAuth("admin", "super_admin"));

adminSubjectRouter.get(
  "/",
  validateRequest({ query: subjectQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: SubjectModel,
      message: "Subjects fetched successfully",
      populate: subjectPopulate,
      filterBuilder: () => ({
        ...(req.query.courseId ? { courseId: req.query.courseId } : {}),
        ...(req.query.departmentId ? { departmentId: req.query.departmentId } : {}),
        ...(req.query.academicYearId ? { academicYearId: req.query.academicYearId } : {}),
        ...(parseBoolean(req.query.isActive) !== undefined
          ? { isActive: parseBoolean(req.query.isActive) }
          : {}),
        ...(buildSearchFilter(req.query.search, ["title", "code", "slug"]) ?? {})
      })
    });
  })
);

adminSubjectRouter.post(
  "/",
  validateRequest({ body: subjectBodySchema }),
  catchAsync(async (req, res) => {
    await createDocument(res, SubjectModel, req.body, "Subject created successfully");
  })
);

adminSubjectRouter.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentById(
      res,
      SubjectModel,
      getParamValue(req.params.id),
      "Subject fetched successfully",
      subjectPopulate
    );
  })
);

adminSubjectRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: subjectBodySchema.partial() }),
  catchAsync(async (req, res) => {
    await updateDocument(
      res,
      SubjectModel,
      getParamValue(req.params.id),
      req.body,
      "Subject updated successfully"
    );
  })
);

adminSubjectRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await deleteDocument(res, SubjectModel, getParamValue(req.params.id), "Subject deleted successfully");
  })
);
