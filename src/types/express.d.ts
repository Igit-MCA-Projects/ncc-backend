import "express";

declare global {
  namespace Express {
    interface Request {
      id: string;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export {};
