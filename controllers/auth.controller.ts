import type { Request, Response } from "express";
import { User } from "../models/user";
import { accessToken, Token } from "../utils/token";
import { sendMail } from "../utils/mail";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const createUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Missing input field" });
    }
    const token = Token(name, password, email);
    await sendMail(token, email);
    res.status(200).json({ message: "Verification email sent" });
};


export const getUsers = async (req: Request, res: Response) => {
    const users = await User.find({});
    res.status(200).json({ message: "users", users });
};

export const verifyEmail = async (req: Request, res: Response) => {
    const token = req.query.token as string;
    if (!token) {
        return res.status(400).json({ message: "Verification failed! Token missing." });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "") as jwt.JwtPayload;
        const { name, email, password } = decoded;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            passwordHash: hashedPassword,
            profileLevel: "fresher",
            satisfiedCount: 0,
            loginCount: 0,
            lastLogin: new Date(),
            sessionsRequested: 0,
            sessionsCompleted: 0,
            resourcesUploaded: 0,
            profileLevelHistory: [
                {
                    level: "fresher"
                }
            ]
        });
        if (name && email) {
            res.redirect("google.com");
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: "Invalid or expired token" });
    }
};


export const signinUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please fill in required fields!" });
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password" });
    }
    const token = accessToken(user._id.toString(), user.email);
    return res.status(200).json({
        message: "Login successful",
        name: user.name,
        email,
        token,
    });
};


export const updateProfile = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        const decoded = jwt.verify(token ?? "", process.env.JWT_SECRET ?? "") as { name: string, email: string, password: string };
        if (!decoded) {
            res.status(401).json({ message: "Invalid token" });
        }
        const { name, email, password } = decoded;
        const userId = User.findOne({ email });
        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ message: "Email already in use" });
            updateData.email = email;
        }
        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateData.passwordHash = hashedPassword;
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                name: updatedUser?.name,
                email: updatedUser?.email,
                profileLevel: updatedUser?.profileLevel,
                satisfiedCount: updatedUser?.satisfiedCount,
            },
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};