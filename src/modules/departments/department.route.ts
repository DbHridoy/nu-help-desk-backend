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
import { DepartmentModel } from "./department.model";

const departmentBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  courseId: objectIdSchema,
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional()
});

const departmentQuerySchema = paginationQuerySchema.extend({
  courseId: objectIdSchema.optional(),
  isActive: z.coerce.boolean().optional()
});

const departmentPopulate = [{ path: "courseId", select: "name slug" }];

export const departmentRouter = Router();

departmentRouter.get(
  "/",
  validateRequest({ query: departmentQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: DepartmentModel,
      message: "Departments fetched successfully",
      baseFilter: { isActive: true },
      populate: departmentPopulate,
      sort: { order: 1, createdAt: -1 },
      filterBuilder: () => ({
        ...(req.query.courseId ? { courseId: req.query.courseId } : {}),
        ...(buildSearchFilter(req.query.search, ["name", "slug"]) ?? {})
      })
    });
  })
);

export const adminDepartmentRouter = Router();

adminDepartmentRouter.use(requireAuth("admin", "super_admin"));

adminDepartmentRouter.get(
  "/",
  validateRequest({ query: departmentQuerySchema }),
  catchAsync(async (req, res) => {
    await listDocuments(req, res, {
      model: DepartmentModel,
      message: "Departments fetched successfully",
      populate: departmentPopulate,
      sort: { order: 1, createdAt: -1 },
      filterBuilder: () => ({
        ...(req.query.courseId ? { courseId: req.query.courseId } : {}),
        ...(parseBoolean(req.query.isActive) !== undefined
          ? { isActive: parseBoolean(req.query.isActive) }
          : {}),
        ...(buildSearchFilter(req.query.search, ["name", "slug"]) ?? {})
      })
    });
  })
);

adminDepartmentRouter.post(
  "/",
  validateRequest({ body: departmentBodySchema }),
  catchAsync(async (req, res) => {
    await createDocument(res, DepartmentModel, req.body, "Department created successfully");
  })
);

adminDepartmentRouter.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await getDocumentById(
      res,
      DepartmentModel,
      getParamValue(req.params.id),
      "Department fetched successfully",
      departmentPopulate
    );
  })
);

adminDepartmentRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: departmentBodySchema.partial() }),
  catchAsync(async (req, res) => {
    await updateDocument(
      res,
      DepartmentModel,
      getParamValue(req.params.id),
      req.body,
      "Department updated successfully"
    );
  })
);

adminDepartmentRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    await deleteDocument(
      res,
      DepartmentModel,
      getParamValue(req.params.id),
      "Department deleted successfully"
    );
  })
);
