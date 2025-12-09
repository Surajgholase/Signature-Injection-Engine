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
    const boxWidthPt = field.wPct * pageWidthPt;
    const boxHeightPt = field.hPct * pageHeightPt;

    const xPt = field.xPct * pageWidthPt;

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

    const sigAspect = imgWidth / imgHeight;
    const boxAspect = boxWidthPt / boxHeightPt;

    let drawWidthPt: number;
    let drawHeightPt: number;

    if (sigAspect > boxAspect) {
        drawWidthPt = boxWidthPt;
        drawHeightPt = boxWidthPt / sigAspect;
    } else {
        drawHeightPt = boxHeightPt;
        drawWidthPt = boxHeightPt * sigAspect;
    }

    const xDrawPt = boxX + (boxWidthPt - drawWidthPt) / 2;
    const yDrawPt = boxY + (boxHeightPt - drawHeightPt) / 2;

    return {
        x: xDrawPt,
        y: yDrawPt,
        width: drawWidthPt,
        height: drawHeightPt
    };
}
