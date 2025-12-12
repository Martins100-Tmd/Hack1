import express from "express";
import { uploadDocuments, getDocuments, getDocumentById, deleteDocument } from "../controllers/document.controller";
import { authMiddleware } from "../middleware/auth";
import multer from "multer";

export const documentRouter = express.Router();

// Multer config (we only use it to get files, they go to Cloudinary)
const storage = multer.memoryStorage(); // memory storage for buffer
const upload = multer({
    storage,
    limits: { files: 4 }, // max 4 files per request
});

// Routes
documentRouter.post("/upload", authMiddleware, upload.array("files", 4), uploadDocuments);
documentRouter.get("/", authMiddleware, getDocuments);
documentRouter.get("/:id", authMiddleware, getDocumentById);
documentRouter.delete("/:id", authMiddleware, deleteDocument);
