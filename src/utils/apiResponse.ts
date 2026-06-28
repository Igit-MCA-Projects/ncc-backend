class ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T | null;
  success: boolean;
  meta?: Record<string, unknown> | undefined;

  constructor(
    statusCode: number,
    message = "Success",
    data: T | null,
    meta?: Record<string, unknown>,
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
    this.meta = meta;
  }
}

export { ApiResponse };
