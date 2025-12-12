// models/HelpRequest.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IHelpRequest extends Document {
    studentId: mongoose.Types.ObjectId;
    assignedExplainerId?: mongoose.Types.ObjectId;
    subject: string;
    topic: string;
    description?: string;
    files?: {
        url: string;
        publicId: string;
        type: string;
        size: number;
    }[];
    status: "open" | "in_progress" | "completed";
    createdAt: Date;
    updatedAt: Date;
}

const helpRequestSchema: Schema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedExplainerId: { type: Schema.Types.ObjectId, ref: "User" },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    description: String,
    files: [
        {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
            type: String,
            size: Number,
        }
    ],
    status: { type: String, enum: ["open", "in_progress", "completed"], default: "open" },
}, { timestamps: true });

export const HelpRequest = mongoose.model<IHelpRequest>("HelpRequest", helpRequestSchema);
