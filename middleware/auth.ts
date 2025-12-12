// middlewares/auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "") as any;
        req.user = { id: decoded.id, email: decoded.email }; // <-- sets req.user
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
