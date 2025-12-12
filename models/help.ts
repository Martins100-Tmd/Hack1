// models/HelpRequest.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IHelpRequest extends Document {
    studentId: mongoose.Types.ObjectId;
    // assignedExplainerId?: mongoose.Types.ObjectId;
    requestClosedBy?: mongoose.Types.ObjectId;
    subject: string;
    topic: string;
    description?: string;
    files?: {
        url: string;
        publicId: string;
        type: string;
        size: number;
    }[];
    status: "open" | "in_progress" | "pending_review" | "completed";
    satisfaction?: "pending" | "unsatisfied" | "satisfied";
    feedback?: string;
    createdAt: Date;
    updatedAt: Date;
}

const helpRequestSchema: Schema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // assignedExplainerId: { type: Schema.Types.ObjectId, ref: "User" },
    requestClosedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    description: String,
    files: [
        {
            url: { type: String },
            publicId: { type: String },
            type: { type: String },
            size: { type: Number }
        }
    ],
    status: {
        type: String,
        enum: ["open", "in_progress", "pending_review", "completed"],
        default: "open"
    },
    satisfaction: {
        type: String,
        enum: ["pending", "unsatisfied", "satisfied"],
        default: "pending"
    },
    feedback: { type: String }
}, { timestamps: true });

export const HelpRequest = mongoose.model<IHelpRequest>("HelpRequest", helpRequestSchema);
