import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CourseModel } from "../courses/course.model";
import { AcademicYearModel } from "../academic-years/academic-year.model";
import { DepartmentModel } from "../departments/department.model";
import { NoticeModel } from "../notices/notice.model";
import { QuestionPaperModel } from "../questions/question.model";
import { ResourceModel } from "../resources/resource.model";
import { RoutineModel } from "../routines/routine.model";
import { StudentRequestModel } from "../student-requests/student-request.model";
import { SubjectModel } from "../subjects/subject.model";
import { SyllabusModel } from "../syllabus/syllabus.model";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  requireAuth("admin", "super_admin"),
  catchAsync(async (_req, res) => {
const [
      courseCount,
      departmentCount,
      academicYearCount,
      subjectCount,
      noticeCount,
      routineCount,
      syllabusCount,
      questionCount,
      resourceCount,
      totalStudentRequests,
      pendingStudentRequests,
      publishedCounts,
      recentResources
    ] = await Promise.all([
      CourseModel.countDocuments(),
      DepartmentModel.countDocuments(),
      AcademicYearModel.countDocuments(),
      SubjectModel.countDocuments(),
      NoticeModel.countDocuments(),
      RoutineModel.countDocuments(),
      SyllabusModel.countDocuments(),
      QuestionPaperModel.countDocuments(),
      ResourceModel.countDocuments(),
      StudentRequestModel.countDocuments(),
      StudentRequestModel.countDocuments({ status: "pending" }),
      Promise.all([
        NoticeModel.countDocuments({ isPublished: true }),
        RoutineModel.countDocuments({ isPublished: true }),
        SyllabusModel.countDocuments({ isPublished: true }),
        QuestionPaperModel.countDocuments({ isPublished: true }),
        ResourceModel.countDocuments({ isPublished: true })
      ]),
      ResourceModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate([
          { path: "courseId", select: "name slug" },
          { path: "departmentId", select: "name slug" },
          { path: "academicYearId", select: "name slug" },
          { path: "subjectId", select: "title code slug" },
          { path: "fileIds", select: "originalName filename url mimeType size createdAt" }
        ])
    ]);

    res.json(
      sendResponse({
        success: true,
        message: "Dashboard overview fetched successfully",
        data: {
          courses: courseCount,
          departments: departmentCount,
          academicYears: academicYearCount,
          subjects: subjectCount,
          notices: noticeCount,
          routines: routineCount,
          syllabus: syllabusCount,
          questions: questionCount,
          resources: resourceCount,
          totalStudentRequests,
          pendingStudentRequests,
          recentResources,
          published: {
            notices: publishedCounts[0],
            routines: publishedCounts[1],
            syllabus: publishedCounts[2],
            questions: publishedCounts[3],
            resources: publishedCounts[4]
          }
        }
      })
    );
  })
);
