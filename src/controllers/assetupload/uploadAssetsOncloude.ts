import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadToCloudinary } from "../../helper/cloudinary.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";

const uploadAsset = asyncHandler(async (req: Request, res: Response) => {
  // Check if file was uploaded
  if (!req.file) {
    throw new ApiError(400, "No file uploaded. Please select a file to upload");
  }

  const cloudinaryRes = await uploadToCloudinary(req.file.path);

  if (!cloudinaryRes) {
    throw new ApiError(400, "File not uploaded to the cloudianry");
  }

  return res.status(200).json(
    new ApiResponse(200, "file uploded successfuly to the cloude",cloudinaryRes.fileUrl),
  );
});

export { uploadAsset };
