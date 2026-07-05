import { Schema, model, type InferSchemaType } from "mongoose";
import { toSlug } from "../../utils/slug";

const noticeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      enum: [
        "exam_notice",
        "form_fill_up",
        "routine",
        "result",
        "admit_card",
        "syllabus_update",
        "general_notice"
      ],
      required: true
    },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear" },
    description: { type: String, required: true, trim: true },
    officialSourceLink: { type: String, trim: true },
    fileIds: [{ type: Schema.Types.ObjectId, ref: "FileUpload" }],
    isVerified: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    noticeDate: { type: Date, required: true }
  },
  { timestamps: true }
);

noticeSchema.pre("validate", function () {
  if (!this.slug && this.title) {
    this.slug = toSlug(this.title);
  }

  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export type Notice = InferSchemaType<typeof noticeSchema>;
export const NoticeModel = model<Notice>("Notice", noticeSchema);
