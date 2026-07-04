import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { validEnv } from "../validator/envValidator.js";

cloudinary.config({
  cloud_name: validEnv.CLOUDINARY_CLOUD_NAME,
  api_key: validEnv.CLOUDINARY_API_KEY,
  api_secret: validEnv.CLOUDINARY_API_SECRET,
});

// upload the assets to the cloudinary and sendback the url and fileid

const uploadToCloudinary = async (filePath: any) => {
  if (!filePath) {
    return null;
  }
  try {
    // upload the file to the cloudinary
    const uploadRes = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    if (!uploadRes) {
      if (validEnv.NODE_ENV === "DEV") {
        console.log(uploadRes);
      }
      return null;
    }
    return {
      fileUrl: uploadRes.url,
      fileId: uploadRes.public_id,
    };
  } catch (error: any) {
    if (validEnv.NODE_ENV === "DEV") {
      console.log(error);
    }
    fs.unlinkSync(filePath);
    return null;
  } finally {
    fs.unlinkSync(filePath);
  }
};

// delete asset from cloudinary
const deleteFromCloudinary = async (fileId: string) => {
  try {
    const deleteRes = await cloudinary.uploader.destroy(fileId);
    if (!deleteRes) {
      if (validEnv.NODE_ENV === "DEV") {
        console.log(deleteRes);
      }
      return false;
    }
    return true;
  } catch (error: any) {
    if (validEnv.NODE_ENV === "DEV") {
      console.log(error);
    }
    return false;
  }
};

export { uploadToCloudinary, deleteFromCloudinary };
