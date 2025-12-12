import express from "express";
import {
    createUser,
    getUsers,
    verifyEmail,
    signinUser,
    updateProfile
} from "../controllers/auth.controller";

export const authRouter = express.Router();

authRouter.post("/create", createUser);
authRouter.get("/users", getUsers);
authRouter.get("/verify", verifyEmail);
authRouter.post("/signin", signinUser);
authRouter.patch("/update", updateProfile);
