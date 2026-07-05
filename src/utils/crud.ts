import type { Request, Response } from "express";
import type { Model, PopulateOptions } from "mongoose";
import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "./AppError";
import { getMeta, getPagination } from "./query";
import { sendResponse } from "./sendResponse";

type BuildListOptions<T> = {
  model: Model<T>;
  message: string;
  baseFilter?: Record<string, unknown>;
  populate?: PopulateOptions | PopulateOptions[];
  sort?: Record<string, 1 | -1>;
  filterBuilder?: (req: Request) => Record<string, unknown>;
};

export const listDocuments = async <T>(
  req: Request,
  res: Response,
  options: BuildListOptions<T>
): Promise<void> => {
  const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
  const builtFilter = options.filterBuilder ? options.filterBuilder(req) : {};
  const filter = {
    ...(options.baseFilter ?? {}),
    ...builtFilter
  } as Record<string, unknown>;

  const [items, total] = await Promise.all([
    options.model
      .find(filter)
      .populate(options.populate ?? [])
      .sort(options.sort ?? { createdAt: -1 })
      .skip(skip)
      .limit(limit),
    options.model.countDocuments(filter)
  ]);

  res.status(HTTP_STATUS.OK).json(
    sendResponse({
      success: true,
      message: options.message,
      data: items,
      meta: getMeta(page, limit, total)
    })
  );
};

export const getDocumentById = async <T>(
  res: Response,
  model: Model<T>,
  id: string,
  message: string,
  populate?: PopulateOptions | PopulateOptions[]
): Promise<void> => {
  const item = await model.findById(id).populate(populate ?? []);

  if (!item) {
    throw new AppError("Resource not found", HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json(
    sendResponse({
      success: true,
      message,
      data: item
    })
  );
};

export const getDocumentBySlug = async <T>(
  res: Response,
  model: Model<T>,
  slug: string,
  message: string,
  filter: Record<string, unknown>,
  populate?: PopulateOptions | PopulateOptions[]
): Promise<void> => {
  const item = await model.findOne({ slug, ...filter } as Record<string, unknown>).populate(populate ?? []);

  if (!item) {
    throw new AppError("Resource not found", HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json(
    sendResponse({
      success: true,
      message,
      data: item
    })
  );
};

export const createDocument = async <T>(
  res: Response,
  model: Model<T>,
  payload: Partial<T>,
  message: string
): Promise<void> => {
  const item = await model.create(payload);
  res.status(HTTP_STATUS.CREATED).json(
    sendResponse({
      success: true,
      message,
      data: item
    })
  );
};

export const updateDocument = async <T>(
  res: Response,
  model: Model<T>,
  id: string,
  payload: Partial<T>,
  message: string
): Promise<void> => {
  const item = await model.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true
  });

  if (!item) {
    throw new AppError("Resource not found", HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json(
    sendResponse({
      success: true,
      message,
      data: item
    })
  );
};

export const getParamValue = (value: string | string[]): string =>
  Array.isArray(value) ? value[0] : value;

export const deleteDocument = async <T>(
  res: Response,
  model: Model<T>,
  id: string,
  message: string
): Promise<void> => {
  const item = await model.findByIdAndDelete(id);

  if (!item) {
    throw new AppError("Resource not found", HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json(
    sendResponse({
      success: true,
      message,
      data: item
    })
  );
};
