import { Schema, model, type InferSchemaType } from "mongoose";
import { toSlug } from "../../utils/slug";

const questionPaperSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    examYear: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    fileIds: [{ type: Schema.Types.ObjectId, ref: "FileUpload" }],
    isVerified: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

questionPaperSchema.pre("validate", function () {
  if (!this.slug && this.title) {
    this.slug = toSlug(this.title);
  }

  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export type QuestionPaper = InferSchemaType<typeof questionPaperSchema>;
export const QuestionPaperModel = model<QuestionPaper>("QuestionPaper", questionPaperSchema);
