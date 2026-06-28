import express from "express";
import { ApiError } from "./utils/apiError.js";
import { globalErrorHandler } from "./utils/globalErrorHandler.js";
import { validEnv } from "./validator/envValidator.js";
import { ApiResponse } from "./utils/apiResponse.js";

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get("/health", (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "Everything is up and running", null));
});

app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// handel global error handling
app.use(globalErrorHandler);

export default app;
