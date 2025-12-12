import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;

    // Level system
    profileLevel: string;
    satisfiedCount: number; // students helped & satisfied

    // Activity metrics
    loginCount: number;
    lastLogin: Date;
    sessionsRequested: number;
    sessionsCompleted: number;
    resourcesUploaded: number;

    // Optional: track level history
    profileLevelHistory: { level: string; date: Date }[];

    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },

        // Level system
        profileLevel: { type: String, default: "fresher" },
        satisfiedCount: { type: Number, default: 0 },

        // Activity metrics
        loginCount: { type: Number, default: 0 },
        lastLogin: { type: Date, default: null },
        sessionsRequested: { type: Number, default: 0 },
        sessionsCompleted: { type: Number, default: 0 },
        resourcesUploaded: { type: Number, default: 0 },

        // Optional history
        profileLevelHistory: [
            {
                level: { type: String },
                date: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
