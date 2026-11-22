export type ApiErrorResponse = {
  error: string;
  message: string;
};

export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
