# Architecture Overview - Signature Injection Engine

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           FRONTEND (React + TypeScript)                 │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │   Toolbox    │  │  PdfViewer   │  │ SignaturePad │ │    │
│  │  │              │  │              │  │              │ │    │
│  │  │ - Text       │  │ - PDF.js     │  │ - Canvas     │ │    │
│  │  │ - Signature  │  │ - Overlay    │  │ - Drawing    │ │    │
│  │  │ - Image      │  │ - Fields     │  │ - Save       │ │    │
│  │  │ - Date       │  │              │  │              │ │    │
│  │  │ - Radio      │  │              │  │              │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                          │    │
│  │  ┌────────────────────────────────────────────────────┐ │    │
│  │  │              App.tsx (Main Component)              │ │    │
│  │  │                                                     │ │    │
│  │  │  - State Management (fields, signature)           │ │    │
│  │  │  - Mode Toggle (Edit/Sign)                        │ │    │
│  │  │  - API Communication                               │ │    │
│  │  └────────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ HTTP/REST API                     │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                              │                                    │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │         BACKEND (Node.js + Express + TypeScript)         │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │              API Routes (api.ts)                  │    │   │
│  │  │                                                    │    │   │
│  │  │  GET  /api/health        - Health check          │    │   │
│  │  │  GET  /api/pdfs/:id      - Get original PDF      │    │   │
│  │  │  POST /api/sign-pdf      - Sign PDF              │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                              │                             │   │
│  │                              ▼                             │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │         PDF Controller (pdfController.ts)        │    │   │
│  │  │                                                    │    │   │
│  │  │  1. Load original PDF from disk                  │    │   │
│  │  │  2. Calculate SHA-256 hash (original)            │    │   │
│  │  │  3. Embed signature image using pdf-lib          │    │   │
│  │  │  4. Convert normalized coordinates to PDF points │    │   │
│  │  │  5. Preserve aspect ratio                        │    │   │
│  │  │  6. Save signed PDF to disk                      │    │   │
│  │  │  7. Calculate SHA-256 hash (signed)              │    │   │
│  │  │  8. Create audit log in MongoDB                  │    │   │
│  │  │  9. Return signed PDF URL                        │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                              │                             │   │
│  │                              ▼                             │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │         PDF Helpers (pdfHelpers.ts)              │    │   │
│  │  │                                                    │    │   │
│  │  │  normalizeToPdfCoordinates()                     │    │   │
│  │  │  - Convert % to PDF points                       │    │   │
│  │  │  - Flip Y-axis (web top-left → PDF bottom-left) │    │   │
│  │  │                                                    │    │   │
│  │  │  fitSignatureInsideBox()                         │    │   │
│  │  │  - Calculate aspect ratio                        │    │   │
│  │  │  - Scale to fit                                  │    │   │
│  │  │  - Center in box                                 │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    FILE SYSTEM                            │   │
│  │                                                            │   │
│  │  ┌──────────────┐              ┌──────────────┐          │   │
│  │  │  pdfs/       │              │  signed/     │          │   │
│  │  │              │              │              │          │   │
│  │  │ - Original   │  ────────▶   │ - Signed     │          │   │
│  │  │   PDFs       │              │   PDFs       │          │   │
│  │  └──────────────┘              └──────────────┘          │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                               │
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Collection: auditlogs                           │    │
│  │                                                          │    │
│  │  {                                                       │    │
│  │    pdfId: "sample-a4",                                  │    │
│  │    originalHash: "sha256...",                           │    │
│  │    signedHash: "sha256...",                             │    │
│  │    fields: [                                            │    │
│  │      {                                                   │    │
│  │        id: "sig-1",                                      │    │
│  │        type: "signature",                               │    │
│  │        pageIndex: 0,                                    │    │
│  │        xPct: 0.3,  // 30% from left                    │    │
│  │        yPct: 0.5,  // 50% from top                     │    │
│  │        wPct: 0.2,  // 20% of page width                │    │
│  │        hPct: 0.05  // 5% of page height                │    │
│  │      }                                                   │    │
│  │    ],                                                    │    │
│  │    signerMeta: {                                        │    │
│  │      ip: "127.0.0.1",                                   │    │
│  │      userAgent: "Mozilla/5.0..."                       │    │
│  │    },                                                    │    │
│  │    createdAt: "2025-12-09T..."                         │    │
│  │  }                                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Options:                                                        │
│  - Local MongoDB (mongodb://localhost:27017)                   │
│  - MongoDB Atlas (mongodb+srv://...)                           │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Edit Mode (Template Creation)

```
User Action                    Frontend                    Backend
───────────                    ────────                    ───────

1. Drag field      ──▶  Create field object
   from toolbox         with normalized coords
                        (xPct, yPct, wPct, hPct)
                             │
                             ▼
2. Position        ──▶  Update field position
   field                (% of page dimensions)
                             │
                             ▼
3. Resize          ──▶  Update field size
   field                (% of page dimensions)
                             │
                             ▼
4. Store in state  ──▶  fields[] array
```

### 2. Sign Mode (PDF Signing)

```
User Action                    Frontend                    Backend
───────────                    ────────                    ───────

1. Click field     ──▶  Open SignaturePad
                        modal
                             │
                             ▼
2. Draw            ──▶  Canvas drawing
   signature            (HTML5 Canvas API)
                             │
                             ▼
3. Save            ──▶  Convert to base64
   signature            data URL
                             │
                             ▼
4. Click "Sign     ──▶  POST /api/sign-pdf  ──▶  1. Load original PDF
   & Download"          {                         2. Embed signature
                          pdfId,                  3. Convert coordinates
                          fields,                 4. Preserve aspect ratio
                          signatureBase64         5. Save signed PDF
                        }                         6. Calculate hashes
                             │                    7. Create audit log
                             │                         │
                             ◀────────────────────────┘
                             │
                             ▼
5. Download        ──▶  Receive signed PDF URL
   signed PDF           and download
```

## Coordinate System Conversion

### Web Coordinates (Frontend)
```
(0,0) ────────────────▶ X
  │
  │   ┌─────────────────┐
  │   │                 │
  │   │   PDF Viewer    │
  ▼   │                 │
  Y   │                 │
      └─────────────────┘

- Origin: Top-left
- Units: Pixels
- Storage: Percentages (0-1)
```

### PDF Coordinates (Backend)
```
      ┌─────────────────┐
  ▲   │                 │
  │   │   PDF Page      │
  Y   │                 │
  │   │                 │
  │   └─────────────────┘
(0,0) ────────────────▶ X

- Origin: Bottom-left
- Units: Points (1/72 inch)
- Conversion: Flip Y-axis
```

### Conversion Formula
```typescript
// Frontend → Storage (Normalized)
xPct = offsetX / pageWidth;   // 0-1
yPct = offsetY / pageHeight;  // 0-1

// Storage → PDF (Points)
xPt = xPct * pageWidthPt;
topPt = pageHeightPt - (yPct * pageHeightPt);  // Flip Y
yPt = topPt - boxHeightPt;
```

## Technology Stack

### Frontend
```
React 19.2.0
  ├── TypeScript 5.9.3
  ├── Vite 7.2.4 (Build tool)
  ├── Tailwind CSS 3.4.18 (Styling)
  ├── react-pdf 10.2.0 (PDF rendering)
  ├── pdfjs-dist 5.4.296 (PDF.js)
  └── react-draggable 4.5.0 (Drag & drop)
```

### Backend
```
Node.js 18+
  ├── Express 5.2.1 (Web framework)
  ├── TypeScript 5.9.3
  ├── Mongoose 9.0.1 (MongoDB ODM)
  ├── pdf-lib 1.17.1 (PDF manipulation)
  ├── Multer 2.0.2 (File upload)
  └── CORS 2.8.5 (Cross-origin)
```

### Database
```
MongoDB
  ├── Local: mongodb://localhost:27017
  └── Atlas: mongodb+srv://...
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         Input Validation                 │
│  - Type checking (TypeScript)           │
│  - Field validation                     │
│  - File size limits                     │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         CORS Protection                  │
│  - Allowed origins                      │
│  - Credentials handling                 │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Hash Verification                │
│  - SHA-256 original PDF                 │
│  - SHA-256 signed PDF                   │
│  - Integrity verification               │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Audit Logging                    │
│  - All operations logged                │
│  - IP address tracking                  │
│  - User-agent tracking                  │
│  - Timestamp tracking                   │
└─────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                            │
│                                                          │
│  ┌────────────────┐         ┌────────────────┐         │
│  │   Frontend     │         │    Backend     │         │
│  │                │         │                │         │
│  │  Vercel/       │  ◀───▶  │  Heroku/       │         │
│  │  Netlify       │         │  AWS/Railway   │         │
│  │                │         │                │         │
│  │  Static Files  │         │  Node.js API   │         │
│  └────────────────┘         └────────────────┘         │
│                                     │                    │
│                                     ▼                    │
│                             ┌────────────────┐          │
│                             │   MongoDB      │          │
│                             │   Atlas        │          │
│                             │                │          │
│                             │  Cloud DB      │          │
│                             └────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
Frontend:
  ✅ Vite for fast builds
  ✅ Code splitting
  ✅ Lazy loading
  ✅ Optimized bundles

Backend:
  ✅ Async/await throughout
  ✅ Streaming for large files
  ✅ Efficient coordinate conversion
  ✅ MongoDB indexing

Database:
  ✅ Indexed queries
  ✅ Connection pooling
  ✅ Efficient schema design
```

---

For more details, see:
- [README.md](./README.md) - Complete documentation
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview
- [COMPLETION.md](./COMPLETION.md) - Completion summary
