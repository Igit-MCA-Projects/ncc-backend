import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { uploadAsset } from "../controllers/assetupload/uploadAssetsOncloude.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const assetsRouter = Router(); // this router only handel the file uploading and deleting form the cloude

assetsRouter
  .route("/upload-file")
  .post(authMiddleware, upload.single("file"), uploadAsset);

export { assetsRouter };
