import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    fileUrl: string;
    fileType: string;
    subject?: string;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const documentSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        description: String,
        fileUrl: { type: String, required: true },
        fileType: String,
        subject: String,
        approved: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocument>("Document", documentSchema);
