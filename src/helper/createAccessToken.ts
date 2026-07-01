import { ApiError } from "../utils/apiError.js";
import { validEnv } from "../validator/envValidator.js";

import jwt from "jsonwebtoken";

const createAccessToken = (id: string) => {
  try {
    const secret: string = String(validEnv.ACCESS_TOKEN_SECRET);
    const expiresIn = Number(validEnv.ACCESS_TOKEN_EXPIRY) * 24 * 60 * 60;

    const accessToken = jwt.sign({ id }, secret, { expiresIn });
    return accessToken;
  } catch (error: any) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while generating access token",
    );
  }
};

export { createAccessToken };
