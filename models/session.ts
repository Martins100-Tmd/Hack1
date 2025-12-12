// models/Session.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
    helpRequestId: mongoose.Types.ObjectId;
    explainerId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    sessionLink: string;
    status: "scheduled" | "completed" | "cancelled";
    satisfaction: boolean;
    createdAt: Date;
    completedAt?: Date;
}

const sessionSchema: Schema = new Schema({
    helpRequestId: { type: Schema.Types.ObjectId, ref: "HelpRequest", required: true },
    explainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionLink: { type: String, required: true },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    satisfaction: { type: Boolean, default: false },
    completedAt: Date,
}, { timestamps: true });

export const Session = mongoose.model<ISession>("Session", sessionSchema);
