import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

export const optionalObjectIdSchema = objectIdSchema.optional();

export const slugParamSchema = z.object({
  slug: z.string().min(1)
});

export const idParamSchema = z.object({
  id: objectIdSchema
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional()
});
