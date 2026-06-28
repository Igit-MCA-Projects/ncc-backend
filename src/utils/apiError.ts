type ErrorDetail = {
  field?: string;
  message: string;
  code?: string;
};

class ApiError extends Error {
  statusCode: number;
  errors: ErrorDetail[];
  success: boolean;
  data: null;
  isOperational: boolean;

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: ErrorDetail[] = [],
    stack = "",
    isOperational = true,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}

export { ApiError };
export type { ErrorDetail };
