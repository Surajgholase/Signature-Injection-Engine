import { PdfField } from '../models/AuditLog';

/**
 * Converts normalized coordinates (0-1 percentages) to PDF points.
 * 
 * Web coordinate system: Top-left origin, measured in pixels
 * PDF coordinate system: Bottom-left origin, measured in points
 * 
 * @param field - Field with normalized coordinates (xPct, yPct, wPct, hPct)
 * @param pageWidthPt - Page width in PDF points
 * @param pageHeightPt - Page height in PDF points
 * @returns Object with x, y, width, height in PDF points
 */
export function normalizeToPdfCoordinates(
    field: PdfField,
    pageWidthPt: number,
    pageHeightPt: number
): { x: number; y: number; width: number; height: number } {
    // Convert percentage-based dimensions to points
    const boxWidthPt = field.wPct * pageWidthPt;
    const boxHeightPt = field.hPct * pageHeightPt;

    // X coordinate: same for both systems (left to right)
    const xPt = field.xPct * pageWidthPt;

    // Y coordinate conversion:
    // - field.yPct is measured from TOP (web convention)
    // - PDF measures from BOTTOM
    // - So we flip: topPt = pageHeight - (yPct * pageHeight)
    // - Then subtract box height to get bottom-left corner
    const topPt = pageHeightPt - (field.yPct * pageHeightPt);
    const yPt = topPt - boxHeightPt;

    return {
        x: xPt,
        y: yPt,
        width: boxWidthPt,
        height: boxHeightPt
    };
}

/**
 * Fits a signature image inside a box while maintaining aspect ratio.
 * Centers the image within the box.
 * 
 * @param signatureDims - Signature image dimensions { width, height }
 * @param boxDims - Box dimensions { width, height }
 * @returns Object with x, y, width, height for drawing the signature
 */
export function fitSignatureInsideBox(
    signatureDims: { width: number; height: number },
    boxDims: { width: number; height: number; x: number; y: number }
): { x: number; y: number; width: number; height: number } {
    const { width: imgWidth, height: imgHeight } = signatureDims;
    const { width: boxWidthPt, height: boxHeightPt, x: boxX, y: boxY } = boxDims;

    // Calculate aspect ratios
    const sigAspect = imgWidth / imgHeight;
    const boxAspect = boxWidthPt / boxHeightPt;

    let drawWidthPt: number;
    let drawHeightPt: number;

    // Fit signature to box while maintaining aspect ratio
    if (sigAspect > boxAspect) {
        // Signature is wider than box - fit to width
        drawWidthPt = boxWidthPt;
        drawHeightPt = boxWidthPt / sigAspect;
    } else {
        // Signature is taller or equal - fit to height
        drawHeightPt = boxHeightPt;
        drawWidthPt = boxHeightPt * sigAspect;
    }

    // Center the signature in the box
    const xDrawPt = boxX + (boxWidthPt - drawWidthPt) / 2;
    const yDrawPt = boxY + (boxHeightPt - drawHeightPt) / 2;

    return {
        x: xDrawPt,
        y: yDrawPt,
        width: drawWidthPt,
        height: drawHeightPt
    };
}
