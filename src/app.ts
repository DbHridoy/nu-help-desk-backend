import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { academicYearRouter, adminAcademicYearRouter } from "./modules/academic-years/academic-year.route";
import { authRouter } from "./modules/auth/auth.route";
import { courseRouter, adminCourseRouter } from "./modules/courses/course.route";
import { dashboardRouter } from "./modules/dashboard/dashboard.route";
import { departmentRouter, adminDepartmentRouter } from "./modules/departments/department.route";
import { noticeRouter, adminNoticeRouter } from "./modules/notices/notice.route";
import { adminQuestionRouter, questionRouter } from "./modules/questions/question.route";
import { adminResourceRouter, resourceRouter } from "./modules/resources/resource.route";
import { adminRoutineRouter, routineRouter } from "./modules/routines/routine.route";
import { searchRouter } from "./modules/search/search.route";
import { adminStudentRequestRouter, studentRequestRouter } from "./modules/student-requests/student-request.route";
import { adminSubjectRouter, subjectRouter } from "./modules/subjects/subject.route";
import { adminSyllabusRouter, syllabusRouter } from "./modules/syllabus/syllabus.route";
import { uploadRouter } from "./modules/uploads/upload.route";
import { sendResponse } from "./utils/sendResponse";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin:
      env.CORS_ORIGINS === "*"
        ? true
        : env.CORS_ORIGINS.split(",").map((item) => item.trim())
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

app.get("/api/health", (_req, res) => {
  res.json(
    sendResponse({
      success: true,
      message: "NU Student Help Website API is healthy",
      data: {
        uptime: process.uptime()
      }
    })
  );
});

app.use("/api/courses", courseRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/academic-years", academicYearRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/notices", noticeRouter);
app.use("/api/routines", routineRouter);
app.use("/api/syllabus", syllabusRouter);
app.use("/api/questions", questionRouter);
app.use("/api/resources", resourceRouter);
app.use("/api/student-requests", studentRequestRouter);
app.use("/api/search", searchRouter);

app.use("/api/admin", authRouter);
app.use("/api/admin/dashboard", dashboardRouter);
app.use("/api/admin/courses", adminCourseRouter);
app.use("/api/admin/departments", adminDepartmentRouter);
app.use("/api/admin/academic-years", adminAcademicYearRouter);
app.use("/api/admin/subjects", adminSubjectRouter);
app.use("/api/admin/notices", adminNoticeRouter);
app.use("/api/admin/routines", adminRoutineRouter);
app.use("/api/admin/syllabus", adminSyllabusRouter);
app.use("/api/admin/questions", adminQuestionRouter);
app.use("/api/admin/resources", adminResourceRouter);
app.use("/api/admin/student-requests", adminStudentRequestRouter);
app.use("/api/admin/uploads", uploadRouter);

app.use(notFoundHandler);
app.use(errorHandler);
