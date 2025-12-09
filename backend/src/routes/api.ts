import express from 'express';
import { signPdf, getPdf } from '../controllers/pdfController';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get original PDF
router.get('/pdfs/:pdfId', getPdf);

// Sign PDF
router.post('/sign-pdf', signPdf);

export default router;
