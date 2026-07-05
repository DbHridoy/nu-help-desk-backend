type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ResponsePayload<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Meta;
};

export const sendResponse = <T>(payload: ResponsePayload<T>): ResponsePayload<T> => payload;
