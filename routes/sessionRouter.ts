import express from "express";
import {
    createSession,
    updateSessionStatus,
    markSatisfaction,
    getSessions,
} from "../controllers/session.controller";
import { authMiddleware } from "../middleware/auth";

export const sessionRouter = express.Router();

sessionRouter.use(authMiddleware);
sessionRouter.post("/", createSession);
sessionRouter.patch("/:id/status", updateSessionStatus);
sessionRouter.patch("/:id/satisfaction", markSatisfaction);
sessionRouter.get("/", getSessions);
