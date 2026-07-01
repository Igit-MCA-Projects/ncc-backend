import { ApiError } from "../utils/apiError.js";
import { validEnv } from "../validator/envValidator.js";

import jwt from "jsonwebtoken";

const createAccessToken = async (id: string) => {
  try {
    // Ensure secret and expiry are plain strings to satisfy jwt type signatures
    const secret: string = String(validEnv.ACCESS_TOKEN_SECRET);
    const expiresIn: string = String(validEnv.ACCESS_TOKEN_EXPIRY) + "d";

    const accessToken = jwt.sign({ id: id }, secret);
    return accessToken;
  } catch (error: any) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while generating access token",
    );
  }
};

export { createAccessToken };
