# Signature Injection Engine

A production-ready MERN full-stack application for PDF signature injection with normalized coordinates, responsive design, and complete audit logging.

## 🎯 Features

- **Normalized Coordinate System**: All field positions stored as percentages (0-1) for true responsive design
- **Drag & Drop Interface**: Intuitive field placement with visual feedback
- **Resizable Fields**: Adjust field dimensions with mouse/touch
- **Signature Pad**: HTML5 Canvas-based signature drawing with touch support
- **PDF Manipulation**: Server-side PDF signing using pdf-lib
- **Audit Logging**: Complete SHA-256 hash tracking in MongoDB
- **Aspect Ratio Preservation**: Signatures fit perfectly within defined boxes
- **Coordinate Conversion**: Seamless translation between web (top-left, pixels) and PDF (bottom-left, points) coordinate systems

## 🏗️ Architecture

### Frontend (`/frontend`)
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for modern styling
- **react-pdf** for PDF rendering
- **Normalized coordinates** for responsive field placement

### Backend (`/backend`)
- **Node.js + Express** REST API
- **MongoDB + Mongoose** for audit logging
- **pdf-lib** for PDF manipulation
- **crypto** module for SHA-256 hashing
- **TypeScript** for type safety

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/signature-injection-engine
# PORT=5000

# Generate sample PDF
node create-sample-pdf.js

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🚀 Usage

### 1. Edit Mode (Template Creation)

1. Open the application in your browser
2. Ensure you're in **Edit Mode** (yellow button in header)
3. Drag field types from the left sidebar onto the PDF:
   - 📝 Text Field
   - ✍️ Signature
   - 🖼️ Image Box
   - 📅 Date Field
   - 🔘 Radio Button
4. **Reposition**: Click and drag fields
5. **Resize**: Drag the blue handle in the bottom-right corner
6. **Delete**: Click the red × button on any field

### 2. Sign Mode (User Signing)

1. Click the mode toggle to switch to **Sign Mode** (green button)
2. Click on any red "Signature" field
3. Draw your signature in the popup canvas
4. Click "Save Signature"
5. Click "Sign & Download" in the header
6. Download your signed PDF from the success message

## 🔧 Technical Details

### Normalized Coordinates

All field positions are stored as percentages (0-1):

```typescript
interface PdfField {
  xPct: number;  // 0-1 from LEFT
  yPct: number;  // 0-1 from TOP
  wPct: number;  // 0-1 of page width
  hPct: number;  // 0-1 of page height
}
```

**Benefits:**
- Fields remain anchored to the same PDF location across different screen sizes
- Works seamlessly on mobile, tablet, and desktop
- No hardcoded pixel values

### Coordinate Conversion (Backend)

The backend converts normalized coordinates to PDF points:

```typescript
// Web: Top-left origin, pixels
// PDF: Bottom-left origin, points

const xPt = xPct * pageWidthPt;
const topPt = pageHeightPt - (yPct * pageHeightPt);
const yPt = topPt - boxHeightPt;
```

See `backend/src/utils/pdfHelpers.ts` for implementation details.

### Aspect Ratio Preservation

Signatures are fitted inside boxes while maintaining aspect ratio:

```typescript
if (sigAspect > boxAspect) {
  // Signature wider than box - fit to width
  drawWidthPt = boxWidthPt;
  drawHeightPt = boxWidthPt / sigAspect;
} else {
  // Signature taller - fit to height
  drawHeightPt = boxHeightPt;
  drawWidthPt = boxHeightPt * sigAspect;
}
```

### Audit Logging

Every signed PDF creates an audit log in MongoDB:

```typescript
{
  pdfId: "sample-a4",
  originalHash: "sha256...",  // Original PDF hash
  signedHash: "sha256...",    // Signed PDF hash
  fields: [...],              // All field positions
  signerMeta: {
    ip: "127.0.0.1",
    userAgent: "Mozilla/5.0..."
  },
  createdAt: "2025-12-08T..."
}
```

## 📁 Project Structure

```
signature-injection-engine/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── pdfController.ts      # Sign PDF logic
│   │   ├── models/
│   │   │   └── AuditLog.ts           # MongoDB schema
│   │   ├── routes/
│   │   │   └── api.ts                # API routes
│   │   ├── utils/
│   │   │   └── pdfHelpers.ts         # Coordinate conversion
│   │   └── index.ts                  # Express server
│   ├── pdfs/                         # Original PDFs
│   ├── signed/                       # Signed PDFs
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DraggableField.tsx    # Field component
│   │   │   ├── PdfViewer.tsx         # PDF renderer
│   │   │   ├── SignaturePad.tsx      # Canvas signature
│   │   │   └── Toolbox.tsx           # Sidebar
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript types
│   │   ├── App.tsx                   # Main component
│   │   ├── App.css
│   │   ├── index.css                 # Tailwind imports
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env
│
└── README.md
```

## 🌐 API Endpoints

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-08T13:27:00.000Z"
}
```

### `GET /api/pdfs/:pdfId`
Retrieve original PDF file.

**Example:** `GET /api/pdfs/sample-a4`

### `POST /api/sign-pdf`
Sign a PDF with signature fields.

**Request:**
```json
{
  "pdfId": "sample-a4",
  "fields": [
    {
      "id": "sig-1",
      "type": "signature",
      "pageIndex": 0,
      "xPct": 0.25,
      "yPct": 0.40,
      "wPct": 0.20,
      "hPct": 0.05
    }
  ],
  "signatureImageBase64": "data:image/png;base64,iVBORw0KGgo..."
}
```

**Response:**
```json
{
  "success": true,
  "signedPdfUrl": "http://localhost:5000/signed/signed-1733662000.pdf",
  "auditLogId": "507f1f77bcf86cd799439011",
  "originalHash": "a3b5c7...",
  "signedHash": "d9e2f4..."
}
```

## 🔐 Security Considerations

- **Input Validation**: All API inputs are validated
- **Hash Verification**: SHA-256 hashes ensure document integrity
- **Audit Trail**: Complete logging of all signing operations
- **CORS**: Configured for specific frontend domain in production
- **File Size Limits**: 50MB limit for base64 images

## 🚢 Deployment

### Backend

1. Build TypeScript:
   ```bash
   npm run build
   ```

2. Set environment variables:
   ```bash
   export MONGODB_URI="mongodb+srv://..."
   export PORT=5000
   export NODE_ENV=production
   ```

3. Start server:
   ```bash
   npm start
   ```

### Frontend

1. Update `.env` with production API URL:
   ```
   VITE_API_BASE_URL=https://your-api.com/api
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Deploy `dist/` folder to hosting service (Vercel, Netlify, etc.)

## 🧪 Testing

### Manual Testing Checklist

- [ ] Drag fields from toolbox to PDF
- [ ] Resize fields using corner handle
- [ ] Delete fields using × button
- [ ] Switch between Edit and Sign modes
- [ ] Draw signature on canvas
- [ ] Sign PDF and verify download
- [ ] Check MongoDB for audit log entry
- [ ] Verify signature appears in correct position
- [ ] Test on mobile device (responsive)
- [ ] Test with different PDF sizes

## 📝 Environment Variables

### Backend (`.env`)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/signature-injection-engine
NODE_ENV=development
```

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🛠️ Development Scripts

### Backend
```bash
npm run dev      # Start with nodemon + ts-node
npm run build    # Compile TypeScript
npm start        # Run compiled JavaScript
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check Atlas connection string
- Verify `MONGODB_URI` in `.env`

### PDF Not Loading
- Check backend is running on port 5000
- Verify `sample-a4.pdf` exists in `backend/pdfs/`
- Check browser console for CORS errors

### Signature Not Appearing
- Ensure you clicked "Save Signature" in the modal
- Verify signature field exists in Edit mode
- Check browser console for errors

### Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is 18+

## 📚 Libraries Used

### Frontend
- `react` - UI framework
- `react-pdf` - PDF rendering
- `pdfjs-dist` - PDF.js library
- `tailwindcss` - Utility-first CSS
- `vite` - Build tool

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `pdf-lib` - PDF manipulation
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables

## 🤝 Contributing

This is a production-ready template. Feel free to:
- Add more field types (checkboxes, dropdowns)
- Implement multi-page support
- Add user authentication
- Implement template saving/loading
- Add email delivery of signed PDFs

## 📄 License

MIT License - feel free to use this project for commercial or personal use.

## 👨‍💻 Author

Built by a Senior MERN Full Stack Engineer as a production-ready signature injection solution.

---

**Happy Signing! ✍️**
