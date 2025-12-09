import mongoose, { Schema, Document } from 'mongoose';

export type FieldType = 'text' | 'signature' | 'image' | 'date' | 'radio';

export interface PdfField {
    id: string;
    pdfId: string;
    pageIndex: number;
    type: FieldType;
    xPct: number;   // 0–1 from LEFT
    yPct: number;   // 0–1 from TOP
    wPct: number;   // 0–1 of page width
    hPct: number;   // 0–1 of page height
}

export interface IAuditLog extends Document {
    pdfId: string;
    createdAt: Date;
    originalHash: string;   // SHA-256 hex
    signedHash: string;     // SHA-256 hex
    fields: PdfField[];
    signerMeta?: {
        ip?: string;
        userAgent?: string;
    };
}

const PdfFieldSchema = new Schema({
    id: { type: String, required: true },
    pdfId: { type: String, required: true },
    pageIndex: { type: Number, required: true },
    type: {
        type: String,
        required: true,
        enum: ['text', 'signature', 'image', 'date', 'radio']
    },
    xPct: { type: Number, required: true, min: 0, max: 1 },
    yPct: { type: Number, required: true, min: 0, max: 1 },
    wPct: { type: Number, required: true, min: 0, max: 1 },
    hPct: { type: Number, required: true, min: 0, max: 1 }
}, { _id: false });

const AuditLogSchema = new Schema({
    pdfId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    originalHash: { type: String, required: true },
    signedHash: { type: String, required: true },
    fields: [PdfFieldSchema],
    signerMeta: {
        ip: String,
        userAgent: String
    }
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
