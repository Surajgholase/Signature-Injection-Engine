import { Request, Response } from 'express';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AuditLog, PdfField } from '../models/AuditLog';
import { normalizeToPdfCoordinates, fitSignatureInsideBox } from '../utils/pdfHelpers';

/**
 * POST /api/sign-pdf
 * Main endpoint for signing PDFs with signature fields
 */
export async function signPdf(req: Request, res: Response) {
    try {
        const { pdfId, fields, signatureImageBase64 } = req.body;

        if (!pdfId || !fields || !signatureImageBase64) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: pdfId, fields, signatureImageBase64'
            });
        }

        // Load original PDF from disk
        const pdfPath = path.join(__dirname, '../../pdfs', `${pdfId}.pdf`);

        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({
                success: false,
                error: `PDF not found: ${pdfId}`
            });
        }

        const originalPdfBuffer = fs.readFileSync(pdfPath);

        // Compute SHA-256 hash of original PDF
        const originalHash = crypto
            .createHash('sha256')
            .update(originalPdfBuffer)
            .digest('hex');

        // Load PDF with pdf-lib
        const pdfDoc = await PDFDocument.load(originalPdfBuffer);

        // Embed signature image
        // Remove data URL prefix if present
        const base64Data = signatureImageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Detect image type and embed
        let signatureImage;
        try {
            signatureImage = await pdfDoc.embedPng(imageBuffer);
        } catch (pngError) {
            try {
                signatureImage = await pdfDoc.embedJpg(imageBuffer);
            } catch (jpgError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid image format. Only PNG and JPG are supported.'
                });
            }
        }

        const imgDims = signatureImage.scale(1);

        // Process each signature field
        const signatureFields = (fields as PdfField[]).filter(f => f.type === 'signature');

        for (const field of signatureFields) {
            const page = pdfDoc.getPages()[field.pageIndex];
            if (!page) {
                console.warn(`Page ${field.pageIndex} not found, skipping field ${field.id}`);
                continue;
            }

            const { width: pageWidthPt, height: pageHeightPt } = page.getSize();

            // Convert normalized coordinates to PDF points
            const boxCoords = normalizeToPdfCoordinates(field, pageWidthPt, pageHeightPt);

            // Fit signature inside box with aspect ratio
            const drawCoords = fitSignatureInsideBox(
                { width: imgDims.width, height: imgDims.height },
                boxCoords
            );

            // Draw signature on page
            page.drawImage(signatureImage, {
                x: drawCoords.x,
                y: drawCoords.y,
                width: drawCoords.width,
                height: drawCoords.height
            });
        }

        // Save modified PDF
        const signedPdfBuffer = await pdfDoc.save();

        // Compute SHA-256 hash of signed PDF
        const signedHash = crypto
            .createHash('sha256')
            .update(signedPdfBuffer)
            .digest('hex');

        // Save signed PDF to disk
        const signedDir = path.join(__dirname, '../../signed');
        if (!fs.existsSync(signedDir)) {
            fs.mkdirSync(signedDir, { recursive: true });
        }

        const timestamp = Date.now();
        const signedFilename = `signed-${timestamp}.pdf`;
        const signedPath = path.join(signedDir, signedFilename);
        fs.writeFileSync(signedPath, signedPdfBuffer);

        // Store audit log in MongoDB
        const auditLog = new AuditLog({
            pdfId,
            originalHash,
            signedHash,
            fields,
            signerMeta: {
                ip: req.ip || req.socket.remoteAddress,
                userAgent: req.get('user-agent')
            }
        });

        await auditLog.save();

        // Return success response
        const signedPdfUrl = `${req.protocol}://${req.get('host')}/signed/${signedFilename}`;

        res.json({
            success: true,
            signedPdfUrl,
            auditLogId: auditLog._id,
            originalHash,
            signedHash
        });

    } catch (error) {
        console.error('Error signing PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while signing PDF'
        });
    }
}

/**
 * GET /api/pdfs/:pdfId
 * Returns the original PDF file
 */
export async function getPdf(req: Request, res: Response) {
    try {
        const { pdfId } = req.params;
        const pdfPath = path.join(__dirname, '../../pdfs', `${pdfId}.pdf`);

        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({
                success: false,
                error: `PDF not found: ${pdfId}`
            });
        }

        res.contentType('application/pdf');
        const pdfStream = fs.createReadStream(pdfPath);
        pdfStream.pipe(res);

    } catch (error) {
        console.error('Error retrieving PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while retrieving PDF'
        });
    }
}
