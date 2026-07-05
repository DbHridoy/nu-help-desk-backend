import { Schema, model, type InferSchemaType } from "mongoose";
import { toSlug } from "../../utils/slug";

const routineSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    examType: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    examStartDate: { type: Date, required: true },
    examEndDate: { type: Date, required: true },
    fileIds: [{ type: Schema.Types.ObjectId, ref: "FileUpload" }],
    isVerified: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

routineSchema.pre("validate", function () {
  if (!this.slug && this.title) {
    this.slug = toSlug(this.title);
  }

  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export type Routine = InferSchemaType<typeof routineSchema>;
export const RoutineModel = model<Routine>("Routine", routineSchema);
