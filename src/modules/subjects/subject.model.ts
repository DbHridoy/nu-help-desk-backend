import { Schema, model, type InferSchemaType } from "mongoose";
import { toSlug } from "../../utils/slug";

const subjectSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

subjectSchema.pre("validate", function () {
  if (!this.slug && this.title) {
    this.slug = toSlug(`${this.title}-${this.code}`);
  }
});

export type Subject = InferSchemaType<typeof subjectSchema>;
export const SubjectModel = model<Subject>("Subject", subjectSchema);
