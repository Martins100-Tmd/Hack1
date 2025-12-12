import type { Request, Response } from "express";
import { DocumentModel, type IDocument } from "../models/document";
import { v2 as cloudinary } from "cloudinary";
import stream from "stream";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadDocuments = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) return res.status(400).json({ message: "No files uploaded" });
        if (files.length > 4) return res.status(400).json({ message: "You can upload at most 4 files at a time" });

        const uploadedDocs: IDocument[] = [];

        for (const file of files) {
            const uploaded: any = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: "auto", folder: "scholargeng" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                const bufferStream = new stream.PassThrough();
                bufferStream.end(file.buffer);
                bufferStream.pipe(uploadStream);
            });
            const doc = await DocumentModel.create({
                userId: req.user?.id,
                title: file.originalname,
                fileUrl: uploaded.secure_url,
                fileType: file.mimetype,
            });

            uploadedDocs.push(doc);
        }

        res.status(201).json({ message: "Files uploaded successfully", documents: uploadedDocs });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Error uploading files" });
    }
};

export const getDocuments = async (_req: Request, res: Response) => {
    try {
        const documents = await DocumentModel.find().populate("userId", "name email profileLevel");
        res.status(200).json({ documents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching documents" });
    }
};

export const getDocumentById = async (req: Request, res: Response) => {
    try {
        const document = await DocumentModel.findById(req.params.id);
        if (!document) return res.status(404).json({ message: "Document not found" });

        res.status(200).json({ document });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching document" });
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const document = await DocumentModel.findById(req.params.id);
        if (!document) return res.status(404).json({ message: "Document not found" });

        if (document.userId.toString() !== req.user?.id) {
            return res.status(403).json({ message: "Forbidden: not your document" });
        }
        const publicId = document.fileUrl.split("/").pop()?.split(".")[0];
        if (publicId) {
            await cloudinary.uploader.destroy(`scholargeng/${publicId}`, { resource_type: "auto" });
        }

        await document.deleteOne();

        res.status(200).json({ message: "Document deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting document" });
    }
};
