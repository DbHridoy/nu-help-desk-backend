import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "../../middleware/validate-request";
import { NoticeModel } from "../notices/notice.model";
import { QuestionPaperModel } from "../questions/question.model";
import { ResourceModel } from "../resources/resource.model";
import { RoutineModel } from "../routines/routine.model";
import { SyllabusModel } from "../syllabus/syllabus.model";
import { catchAsync } from "../../utils/catchAsync";
import { getMeta, getPagination } from "../../utils/query";
import { sendResponse } from "../../utils/sendResponse";

const searchQuerySchema = z.object({
  q: z.string().min(1),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  courseId: z.string().optional(),
  departmentId: z.string().optional(),
  academicYearId: z.string().optional(),
  subjectId: z.string().optional()
});

const populate = [
  { path: "courseId", select: "name slug" },
  { path: "departmentId", select: "name slug" },
  { path: "academicYearId", select: "name slug" },
  { path: "subjectId", select: "title code slug" }
];

export const searchRouter = Router();

searchRouter.get(
  "/",
  validateRequest({ query: searchQuerySchema }),
  catchAsync(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
    const q = String(req.query.q).trim();
    const regex = new RegExp(q, "i");
    const scopedFilter = {
      isPublished: true,
      ...(req.query.courseId ? { courseId: req.query.courseId } : {}),
      ...(req.query.departmentId ? { departmentId: req.query.departmentId } : {}),
      ...(req.query.academicYearId ? { academicYearId: req.query.academicYearId } : {}),
      ...(req.query.subjectId ? { subjectId: req.query.subjectId } : {})
    } as Record<string, unknown>;

    const [notices, routines, syllabus, questions, resources] = await Promise.all([
      NoticeModel.find({
        ...scopedFilter,
        $or: [{ title: regex }, { description: regex }, { category: regex }]
      } as Record<string, unknown>).populate(populate),
      RoutineModel.find({
        ...scopedFilter,
        $or: [{ title: regex }, { description: regex }, { examType: regex }]
      } as Record<string, unknown>).populate(populate),
      SyllabusModel.find({
        ...scopedFilter,
        $or: [{ title: regex }, { description: regex }, { subjectTitle: regex }, { subjectCode: regex }]
      } as Record<string, unknown>).populate(populate),
      QuestionPaperModel.find({
        ...scopedFilter,
        $or: [{ title: regex }, { description: regex }]
      } as Record<string, unknown>).populate(populate),
      ResourceModel.find({
        ...scopedFilter,
        $or: [{ title: regex }, { description: regex }, { resourceType: regex }]
      } as Record<string, unknown>).populate(populate)
    ]);

    const merged = [
      ...notices.map((item) => ({ type: "notice", item })),
      ...routines.map((item) => ({ type: "routine", item })),
      ...syllabus.map((item) => ({ type: "syllabus", item })),
      ...questions.map((item) => ({ type: "question", item })),
      ...resources.map((item) => ({ type: "resource", item }))
    ].sort((a, b) => {
      const aTime = new Date((a.item as { createdAt?: Date }).createdAt ?? 0).getTime();
      const bTime = new Date((b.item as { createdAt?: Date }).createdAt ?? 0).getTime();
      return bTime - aTime;
    });

    const paged = merged.slice(skip, skip + limit);

    res.json(
      sendResponse({
        success: true,
        message: "Search results fetched successfully",
        data: paged,
        meta: getMeta(page, limit, merged.length)
      })
    );
  })
);
