import type { Request, Response } from "express";
import { Session } from "../models/session";

export const createSession = async (req: Request, res: Response) => {
    try {
        const { helpRequestId, explainerId, studentId, sessionLink } = req.body;
        if (!helpRequestId || !explainerId || !studentId || !sessionLink) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const session = await Session.create({
            helpRequestId,
            explainerId,
            studentId,
            sessionLink,
            status: "scheduled",
            satisfaction: false,
        });
        res.status(201).json({ message: "Session created", session });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating session" });
    }
};

export const updateSessionStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        if (!["scheduled", "completed", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const session = await Session.findByIdAndUpdate(
            id,
            { status, completedAt: status === "completed" ? new Date() : undefined },
            { new: true }
        );
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.status(200).json({ message: "Session updated", session });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating session" });
    }
};

export const markSatisfaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { satisfaction } = req.body;
        const session = await Session.findByIdAndUpdate(id, { satisfaction }, { new: true });
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.status(200).json({ message: "Satisfaction updated", session });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating satisfaction" });
    }
};

export const getSessions = async (req: Request, res: Response) => {
    try {
        const { userId, role } = req.query;
        if (!userId || !role) return res.status(400).json({ message: "Missing userId or role" });
        const filter = role === "student" ? { studentId: userId } : { explainerId: userId };
        const sessions = await Session.find(filter)
            .populate("studentId", "name email profileLevel")
            .populate("explainerId", "name email profileLevel")
            .populate("helpRequestId");
        res.status(200).json({ sessions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching sessions" });
    }
};
