import express from 'express';
import multer from 'multer';
import path from 'path';
import { signPdf, getPdf, uploadPdf } from '../controllers/pdfController';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../pdfs'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-pdf-' + uniqueSuffix + '.pdf');
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'));
        }
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get original PDF
router.get('/pdfs/:pdfId', getPdf);

// Sign PDF
router.post('/sign-pdf', signPdf);

// Upload PDF
router.post('/upload-pdf', upload.single('pdf'), uploadPdf);

export default router;

