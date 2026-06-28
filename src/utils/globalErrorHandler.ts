import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "./apiError.js";
import { ApiResponse } from "./apiResponse.js";
import { validEnv } from "../validator/envValidator.js";

const globalErrorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isDev = validEnv.NODE_ENV === "DEV";

  if (err instanceof ApiError) {
    const payload = new ApiResponse(err.statusCode, err.message, null, {
      errors: err.errors ?? [],
      ...(isDev ? { stack: err.stack } : {}),
    });

    return res.status(err.statusCode).json(payload);
  }

  if (err instanceof ZodError) {
    const errors = err.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
      code: i.code,
    }));

    const payload = new ApiResponse(422, "Validation failed", null, {
      errors,
      ...(isDev ? { stack: err.stack } : {}),
    });

    return res.status(422).json(payload);
  }

  if (err instanceof SyntaxError && "body" in err) {
    const payload = new ApiResponse(400, "Invalid JSON payload", null, {
      errors: [],
      ...(isDev ? { stack: err.stack } : {}),
    });

    return res.status(400).json(payload);
  }

  if (isDev) console.error("Runtime Error:", err);

  const message = isDev
    ? err.message || "Internal Server Error"
    : "Internal Server Error";
  const payload = new ApiResponse(500, message, null, {
    errors: [],
    ...(isDev ? { stack: err.stack } : {}),
  });

  return res.status(500).json(payload);
};

export { globalErrorHandler };
