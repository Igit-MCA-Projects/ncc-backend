import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";
import { db } from "../db/prisma.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { validEnv } from "../validator/envValidator.js";

interface accessTokenPayload extends JwtPayload {
  id: string;
}

const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accesstoken;
    if (!token) {
      throw new ApiError(400, "Access denied, authenication required", [
        {
          field: "token",
          message: "No access token is found",
        },
      ]);
    }

    // check the token is in right format or not
    if (!token.startsWith("Bearer")) {
      throw new ApiError(400, "Access denied, authenication required", [
        {
          field: "Invalid token format",
          message: "Invalid token type, expecting an Bearer token",
        },
      ]);
    }

    // extract the access token
    const accessToken = token.split(" ")[1];
    if (!accessToken) {
      throw new ApiError(400, "Access denied, authenication required", [
        {
          field: "access token",
          message: "No token found with Bearer",
        },
      ]);
    }

    // vefiy the token
    const verifyAccessToken = jwt.verify(
      accessToken,
      validEnv.ACCESS_TOKEN_SECRET,
    ) as accessTokenPayload;
    if (!verifyAccessToken.id) {
      throw new ApiError(400, "Access denied, authenication required", [
        {
          field: "token payload",
          message: "Reqired data is not present in the token",
        },
      ]);
    }

    const student = await db.student.findFirst({
      where: {
        id: verifyAccessToken.id,
      },
      select: {
        id: true,
      },
    });

    const admin = await db.admin.findFirst({
      where: {
        id: verifyAccessToken.id,
      },
      select: {
        id: true,
      },
    });

    if (!student && !admin) {
      throw new ApiError(400, "Access denied, authenication required", [
        {
          field: "Invalid user token",
          message: "Provided token data is not found in db",
        },
      ]);
    }
    if (student) {
      req.id = student.id;
    }

    if (admin) {
      req.id = admin.id;
    }

    next();
  },
);

export {authMiddleware}