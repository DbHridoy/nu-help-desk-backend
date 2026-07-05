import { Schema, model, type InferSchemaType } from "mongoose";
import { toSlug } from "../../utils/slug";

const resourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    resourceType: {
      type: String,
      enum: ["notes", "suggestions", "short_questions", "important_topics", "model_questions"],
      required: true
    },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
    description: { type: String, required: true, trim: true },
    fileIds: [{ type: Schema.Types.ObjectId, ref: "FileUpload" }],
    isVerified: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

resourceSchema.pre("validate", function () {
  if (!this.slug && this.title) {
    this.slug = toSlug(this.title);
  }

  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export type Resource = InferSchemaType<typeof resourceSchema>;
export const ResourceModel = model<Resource>("Resource", resourceSchema);
