export type PaginationMeta = {
  page: number;
  limit: number;
  skip: number;
};

export const getPagination = (query: Record<string, unknown>): PaginationMeta => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

export const getMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1
});

export const buildSearchFilter = <T>(
  search: unknown,
  fields: string[]
): Record<string, unknown> | null => {
  if (typeof search !== "string" || !search.trim()) {
    return null;
  }

  const regex = new RegExp(search.trim(), "i");
  return {
    $or: fields.map((field) => ({ [field]: regex }))
  };
};

export const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return undefined;
};
