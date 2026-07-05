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
import { buildSearchFilter } from "../../utils/query";
import { idParamSchema, objectIdSchema, paginationQuerySchema } from "../../utils/validation";
import { StudentRequestModel } from "./student-request.model";

const studentRequestBodySchema = z.object({
  name: z.string().optional(),
  courseId: objectIdSchema.optional(),
  departmentId: objectIdSchema.optional(),
  academicYearId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  courseText: z.string().optional(),
  departmentText: z.string().optional(),
  yearText: z.string().optional(),
  subjectText: z.string().optional(),
  whatTheyNeed: z.string().min(1),
  message: z.string().min(1)
});

const adminStudentRequestBodySchema = studentRequestBodySchema.extend({
  status: z.enum(["pending", "completed", "rejected"]).optional()
});

const studentRequestQuerySchema = paginationQuerySchema.extend({
  courseId: objectIdSchema.optional(),
  departmentId: objectIdSchema.optional(),
  academicYearId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  status: z.enum(["pending", "completed", "rejected"]).optional()
});

const studentRequestPopulate = [
  { path: "courseId", select: "name slug" },
  { path: "departmentId", select: "name slug" },
  { path: "academicYearId", select: "name slug" },
  { path: "subjectId", select: "title code slug" }
];

export const studentRequestRouter = Router();

studentRequestRouter.post(
  "/",
  validateRequest({ body: studentRequestBodySchema }),
  catchAsync(async (req, res) => {
    await createDocument(res, StudentRequestModel, req.body, "Student request submitted successfully");
  })
);

export const adminStudentRequestRouter = Router();

adminStudentRequestRouter.use(requireAuth("admin", "super_admin"));

adminStudentRequestRouter.get(
  "/",
  validateRequest({ query: studentRequestQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: StudentRequestModel,
      message: "Student requests fetched successfully",
      populate: studentRequestPopulate,
      filterBuilder: () => ({
        ...(req.query.courseId ? { courseId: req.query.courseId } : {}),
        ...(req.query.departmentId ? { departmentId: req.query.departmentId } : {}),
        ...(req.query.academicYearId ? { academicYearId: req.query.academicYearId } : {}),
        ...(req.query.subjectId ? { subjectId: req.query.subjectId } : {}),
        ...(req.query.status ? { status: req.query.status } : {}),
        ...(buildSearchFilter(req.query.search, [
          "name",
          "whatTheyNeed",
          "message",
          "courseText",
          "departmentText",
          "yearText",
          "subjectText"
        ]) ?? {})
      })
    });
  })
);

adminStudentRequestRouter.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentById(
      res,
      StudentRequestModel,
      getParamValue(req.params.id),
      "Student request fetched successfully",
      studentRequestPopulate
    );
  })
);

adminStudentRequestRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: adminStudentRequestBodySchema.partial() }),
  catchAsync(async (req, res) => {
    await updateDocument(
      res,
      StudentRequestModel,
      getParamValue(req.params.id),
      req.body,
      "Student request updated successfully"
    );
  })
);

adminStudentRequestRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await deleteDocument(
      res,
      StudentRequestModel,
      getParamValue(req.params.id),
      "Student request deleted successfully"
    );
  })
);
