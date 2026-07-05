import { Schema, model, type InferSchemaType } from "mongoose";

const studentRequestSchema = new Schema(
  {
    name: { type: String, trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear" },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
    courseText: { type: String, trim: true },
    departmentText: { type: String, trim: true },
    yearText: { type: String, trim: true },
    subjectText: { type: String, trim: true },
    whatTheyNeed: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export type StudentRequest = InferSchemaType<typeof studentRequestSchema>;
export const StudentRequestModel = model<StudentRequest>("StudentRequest", studentRequestSchema);
