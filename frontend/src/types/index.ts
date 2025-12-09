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

export interface ToolboxItem {
    type: FieldType;
    label: string;
    icon: string;
}

export type AppMode = 'edit' | 'sign';

export interface SignPdfRequest {
    pdfId: string;
    fields: PdfField[];
    signatureImageBase64: string;
}

export interface SignPdfResponse {
    success: boolean;
    signedPdfUrl?: string;
    auditLogId?: string;
    originalHash?: string;
    signedHash?: string;
    error?: string;
}
