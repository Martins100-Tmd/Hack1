import type { Request, Response } from "express";
import { HelpRequest } from "../models/help";
import { v2 as cloudinary } from "cloudinary";
import { Types } from "mongoose";
import { User } from "../models/user";

export const createHelpRequest = async (req: Request, res: Response) => {
    try {
        const email = req.user?.email;
        const student = await User.findOne({ email });
        const studentId = student?._id;
        if (!studentId) return res.status(401).json({ message: "Unauthorized" });
        const { subject, topic, description } = req.body;
        if (!subject || !topic)
            return res.status(400).json({ message: "Subject and topic are required" });
        const files = req.files as Express.Multer.File[] | undefined;
        let uploadedFiles: any[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const upload = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                    { folder: "scholargeng/helpRequests", resource_type: "auto" }
                );
                uploadedFiles.push({
                    url: upload.secure_url,
                    publicId: upload.public_id,
                    type: file.mimetype,
                    size: file.size,
                });
            }
        }
        const helpRequest = await HelpRequest.create({
            studentId,
            subject,
            topic,
            description,
            files: uploadedFiles,
            requestClosedBy: undefined
        });
        res.status(201).json({
            message: "Help request created successfully",
            helpRequest,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


export const getAllHelpRequests = async (_req: Request, res: Response) => {
    try {
        const requests = await HelpRequest.find({ status: "open" })
            .populate("studentId", "name email");
        res.status(200).json({ requests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


export const getHelpRequestById = async (req: Request, res: Response) => {
    try {
        const request = await HelpRequest.findById(req.params.id)
            .populate("studentId", "name email")
            .populate("assignedExplainerId", "name email");
        if (!request) return res.status(404).json({ message: "Help request not found" });
        res.status(200).json({ request });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


export const acceptHelpRequest = async (req: Request, res: Response) => {
    try {
        const explainerId = req.user?.id;
        if (!explainerId) return res.status(401).json({ message: "Unauthorized" });
        const requestId = req.params.id;
        const request = await HelpRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: "Help request not found" });
        if (request.status !== "open")
            return res.status(400).json({ message: "This request is already taken" });
        //request.assignedExplainerId = new Types.ObjectId(explainerId);
        request.status = "in_progress";
        await request.save();
        res.status(200).json({
            message: "Help request accepted",
            request,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


export const completeHelpRequest = async (req: Request, res: Response) => {
    try {
        const studentId = req.user?.id;
        const request = await HelpRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Help request not found" });
        if (request.studentId.toString() !== studentId)
            return res.status(403).json({ message: "Only the student can complete the request" });
        request.status = "completed";
        await request.save();
        res.status(200).json({ message: "Help request marked as solved" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
