import { Schema, model, type InferSchemaType } from "mongoose";
import { toSlug } from "../../utils/slug";

const academicYearSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

academicYearSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = toSlug(this.name);
  }
});

export type AcademicYear = InferSchemaType<typeof academicYearSchema>;
export const AcademicYearModel = model<AcademicYear>("AcademicYear", academicYearSchema);
