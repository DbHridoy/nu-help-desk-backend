import { connectDatabase } from "../config/db";
import { AcademicYearModel } from "../modules/academic-years/academic-year.model";
import { AdminModel } from "../modules/admins/admin.model";
import { CourseModel } from "../modules/courses/course.model";
import { DepartmentModel } from "../modules/departments/department.model";
import { NoticeModel } from "../modules/notices/notice.model";
import { QuestionPaperModel } from "../modules/questions/question.model";
import { ResourceModel } from "../modules/resources/resource.model";
import { RoutineModel } from "../modules/routines/routine.model";
import { StudentRequestModel } from "../modules/student-requests/student-request.model";
import { SubjectModel } from "../modules/subjects/subject.model";
import { SyllabusModel } from "../modules/syllabus/syllabus.model";
import { hashPassword } from "../utils/password";

const seed = async (): Promise<void> => {
  await connectDatabase();

  await Promise.all([
    AdminModel.deleteMany({}),
    NoticeModel.deleteMany({}),
    RoutineModel.deleteMany({}),
    SyllabusModel.deleteMany({}),
    QuestionPaperModel.deleteMany({}),
    ResourceModel.deleteMany({}),
    StudentRequestModel.deleteMany({}),
    SubjectModel.deleteMany({}),
    DepartmentModel.deleteMany({}),
    AcademicYearModel.deleteMany({}),
    CourseModel.deleteMany({})
  ]);

  const admin = await AdminModel.create({
    name: "NU Help Desk Admin",
    email: "admin@nuhelpdesk.com",
    passwordHash: await hashPassword("Admin@12345"),
    role: "super_admin",
    isActive: true
  });

  const course = await CourseModel.create({
    name: "Honours course",
    slug: "honours",
    order: 1,
    isActive: true
  });

  const [accounting, management, english] = await DepartmentModel.create([
    {
      name: "Accounting",
      slug: "accounting",
      courseId: course.id,
      order: 1,
      isActive: true
    },
    {
      name: "Management",
      slug: "management",
      courseId: course.id,
      order: 2,
      isActive: true
    },
    {
      name: "English",
      slug: "english",
      courseId: course.id,
      order: 3,
      isActive: true
    }
  ]);

  const [firstYear, secondYear] = await AcademicYearModel.create([
    {
      name: "1st Year",
      slug: "1st-year",
      order: 1,
      isActive: true
    },
    {
      name: "2nd Year",
      slug: "2nd-year",
      order: 2,
      isActive: true
    }
  ]);

  const [financialAccounting, businessManagement, englishFoundations] = await SubjectModel.create([
    {
      title: "Financial Accounting",
      code: "ACC-101",
      slug: "financial-accounting-acc-101",
      courseId: course.id,
      departmentId: accounting.id,
      academicYearId: firstYear.id,
      isActive: true
    },
    {
      title: "Principles of Management",
      code: "MGT-201",
      slug: "principles-of-management-mgt-201",
      courseId: course.id,
      departmentId: management.id,
      academicYearId: secondYear.id,
      isActive: true
    },
    {
      title: "English Foundations",
      code: "ENG-102",
      slug: "english-foundations-eng-102",
      courseId: course.id,
      departmentId: english.id,
      academicYearId: firstYear.id,
      isActive: true
    }
  ]);

  await NoticeModel.create([
    {
      title: "Honours Form Fill Up Notice 2026",
      slug: "honours-form-fill-up-notice-2026",
      category: "form_fill_up",
      courseId: course.id,
      academicYearId: firstYear.id,
      description: "Sample form fill up notice for Honours first year students.",
      officialSourceLink: "https://www.nu.ac.bd",
      fileIds: [],
      isVerified: true,
      isPublished: true,
      publishedAt: new Date(),
      noticeDate: new Date("2026-06-15")
    },
    {
      title: "NU Result Publication Notice",
      slug: "nu-result-publication-notice",
      category: "result",
      courseId: course.id,
      description: "Sample result publication notice for MVP testing.",
      officialSourceLink: "https://www.nu.ac.bd",
      fileIds: [],
      isVerified: true,
      isPublished: true,
      publishedAt: new Date(),
      noticeDate: new Date("2026-06-10")
    }
  ]);

  await RoutineModel.create([
    {
      title: "Accounting 1st Year Examination Routine",
      slug: "accounting-1st-year-examination-routine",
      courseId: course.id,
      departmentId: accounting.id,
      academicYearId: firstYear.id,
      examType: "Final Exam",
      description: "Sample routine for Accounting first year final examination.",
      examStartDate: new Date("2026-07-15"),
      examEndDate: new Date("2026-07-25"),
      fileIds: [],
      isVerified: true,
      isPublished: true,
      publishedAt: new Date()
    }
  ]);

  await SyllabusModel.create([
    {
      title: "Accounting 1st Year Syllabus",
      slug: "accounting-1st-year-syllabus",
      courseId: course.id,
      departmentId: accounting.id,
      academicYearId: firstYear.id,
      subjectId: financialAccounting.id,
      subjectCode: financialAccounting.code,
      subjectTitle: financialAccounting.title,
      description: "Sample syllabus content for Financial Accounting.",
      fileIds: [],
      isVerified: true,
      isPublished: true,
      publishedAt: new Date()
    }
  ]);

  await QuestionPaperModel.create([
    {
      title: "Financial Accounting 2024 Previous Question",
      slug: "financial-accounting-2024-previous-question",
      courseId: course.id,
      departmentId: accounting.id,
      academicYearId: firstYear.id,
      subjectId: financialAccounting.id,
      examYear: 2024,
      description: "Sample previous year question paper entry.",
      fileIds: [],
      isVerified: true,
      isPublished: true,
      publishedAt: new Date()
    }
  ]);

  await ResourceModel.create([
    {
      title: "Financial Accounting Notes Pack",
      slug: "financial-accounting-notes-pack",
      resourceType: "notes",
      courseId: course.id,
      departmentId: accounting.id,
      academicYearId: firstYear.id,
      subjectId: financialAccounting.id,
      description: "Sample notes resource for Financial Accounting.",
      fileIds: [],
      isVerified: true,
      isPublished: true,
      publishedAt: new Date()
    },
    {
      title: "Management Important Topics",
      slug: "management-important-topics",
      resourceType: "important_topics",
      courseId: course.id,
      departmentId: management.id,
      academicYearId: secondYear.id,
      subjectId: businessManagement.id,
      description: "Sample important topics resource for management students.",
      fileIds: [],
      isVerified: true,
      isPublished: true,
      publishedAt: new Date()
    }
  ]);

  await StudentRequestModel.create([
    {
      name: "Rahim",
      courseId: course.id,
      departmentId: english.id,
      academicYearId: firstYear.id,
      subjectId: englishFoundations.id,
      whatTheyNeed: "Need previous year questions",
      message: "Please upload English Foundations previous year questions.",
      status: "pending"
    },
    {
      name: "Karim",
      courseText: "Honours",
      departmentText: "Economics",
      yearText: "2nd Year",
      subjectText: "Microeconomics",
      whatTheyNeed: "Need class notes",
      message: "I could not find notes for Microeconomics second year.",
      status: "completed"
    }
  ]);

  console.log("Seed completed successfully.");
  console.log("Admin email: admin@nuhelpdesk.com");
  console.log("Admin password: Admin@12345");
  console.log(`Seeded by admin: ${admin.email}`);
};

void seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([
      AdminModel.db.close()
    ]);
  });
