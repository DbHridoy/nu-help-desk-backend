import { Schema, model, type InferSchemaType } from "mongoose";

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin"
    },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

export type Admin = InferSchemaType<typeof adminSchema>;
export const AdminModel = model<Admin>("Admin", adminSchema);
