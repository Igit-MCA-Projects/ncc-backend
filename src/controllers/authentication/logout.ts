import type { Request, Response } from "express";
import { db } from "../../db/prisma.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validEnv } from "../../validator/envValidator.js";

const logout = asyncHandler(async (req: Request, res: Response) => {
    
  res.clearCookie("accesstoken", {
    httpOnly: true,
    sameSite: validEnv.NODE_ENV === "PROD" ? "none" : "lax",
    secure: validEnv.NODE_ENV === "PROD" ? true : false,
    path: "/",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully", null));
});

export { logout };
