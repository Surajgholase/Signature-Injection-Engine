# Signature Injection Engine 🖊️

A modern, full-stack web application that makes PDF signing simple and intuitive. Built with the MERN stack, this tool lets you create signature fields on PDFs and sign them digitally with ease.

## Why This Project?

Ever needed to sign a PDF but found yourself printing it out, signing it, and scanning it back? Yeah, we've all been there. This project solves that problem by letting you sign PDFs right in your browser. No printing, no scanning, just pure digital convenience.

## What Can It Do?

- **Drag & Drop Interface**: Place signature fields anywhere on your PDF with a simple drag and drop
- **Draw Your Signature**: Use your mouse or touchscreen to draw your signature naturally
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Secure Signing**: Every signed PDF is tracked with SHA-256 hashing for integrity
- **Audit Trail**: Complete logging of all signing activities in MongoDB
- **Smart Positioning**: Signature fields stay exactly where you put them, regardless of screen size

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for lightning-fast development
- Tailwind CSS for beautiful styling
- react-pdf for PDF rendering

**Backend:**
- Node.js with Express
- MongoDB for data persistence
- pdf-lib for PDF manipulation
- TypeScript throughout for type safety

## Getting Started

### Prerequisites

Make sure you have these installed:
- Node.js (version 18 or higher)
- MongoDB (either locally or use MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/signature-injection-engine.git
   cd signature-injection-engine
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the backend folder:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/signature-injection-engine
   NODE_ENV=development
   ```

   Generate a sample PDF to test with:
   ```bash
   node create-sample-pdf.js
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

   Create a `.env` file in the frontend folder:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the application**

   In one terminal (backend):
   ```bash
   cd backend
   npm run dev
   ```

   In another terminal (frontend):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` and you're ready to go!

## How to Use

### Creating a Signature Template (Edit Mode)

1. When you first open the app, you'll be in **Edit Mode** (yellow button in the header)
2. Look at the sidebar on the left - you'll see different field types
3. Drag the "Signature" field onto your PDF wherever you want someone to sign
4. You can move it around by clicking and dragging
5. Resize it by dragging the blue handle in the bottom-right corner
6. Need to remove it? Click the red × button

### Signing a PDF (Sign Mode)

1. Click the mode toggle to switch to **Sign Mode** (green button)
2. Click on any red signature field
3. A drawing pad will pop up - draw your signature with your mouse or finger
4. Click "Save Signature" when you're happy with it
5. Hit the "Sign & Download" button in the header
6. Your signed PDF will download automatically!

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended for Quick Start)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (the free tier works great)
4. Set up a database user with a password
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string and update it in `backend/.env`

### Option 2: Local MongoDB

1. Download MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install it following the instructions for your OS
3. Start the MongoDB service
4. The default connection string in `.env` should work as-is

## Project Structure

```
signature-injection-engine/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   └── index.ts        # Server entry point
│   ├── pdfs/               # Original PDFs
│   └── signed/             # Signed PDFs output
│
└── frontend/               # React application
    ├── src/
    │   ├── components/     # React components
    │   ├── types/          # TypeScript definitions
    │   └── App.tsx         # Main app component
    └── public/             # Static assets
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns the server status.

### Get PDF
```
GET /api/pdfs/:pdfId
```
Retrieves the original PDF file.

### Sign PDF
```
POST /api/sign-pdf
```
Signs a PDF with the provided signature.

**Request Body:**
```json
{
  "pdfId": "sample-a4",
  "fields": [
    {
      "id": "field-123",
      "type": "signature",
      "pageIndex": 0,
      "xPct": 0.3,
      "yPct": 0.5,
      "wPct": 0.2,
      "hPct": 0.05
    }
  ],
  "signatureImageBase64": "data:image/png;base64,..."
}
```

## How It Works Under the Hood

### Coordinate System Magic

One of the trickiest parts of this project is handling coordinates. Your browser uses a coordinate system where (0,0) is at the top-left, but PDFs use bottom-left as (0,0). Plus, we need everything to work on different screen sizes.

Here's how we solved it:

1. **Store as Percentages**: All field positions are stored as percentages (0 to 1) of the page dimensions
2. **Convert on Display**: When showing the PDF, we convert these percentages to pixels based on your screen
3. **Convert for PDF**: When signing, we convert to PDF points and flip the Y-axis

This means a signature field at 30% from the left and 50% from the top will always be in the same spot on the PDF, no matter what device you're using.

### Security & Integrity

Every time a PDF is signed:
- We calculate a SHA-256 hash of the original PDF
- We calculate a SHA-256 hash of the signed PDF
- Both hashes are stored in MongoDB along with:
  - The signer's IP address
  - Their browser information
  - Timestamp of the signing
  - All field positions

This creates a complete audit trail that can verify the integrity of any signed document.

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in the `dist` folder, ready to deploy.

## Deployment

### Backend (Heroku Example)
```bash
cd backend
heroku create your-app-name
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
git push heroku main
```

### Frontend (Vercel Example)
```bash
cd frontend
npm run build
vercel --prod
```

Don't forget to update the `VITE_API_BASE_URL` in your frontend environment variables to point to your deployed backend!

## Common Issues & Solutions

**MongoDB won't connect?**
- Make sure MongoDB is running (`mongod` command)
- Check your connection string in `.env`
- For Atlas, verify your IP is whitelisted

**PDF not loading?**
- Ensure the backend server is running
- Check that `sample-a4.pdf` exists in `backend/pdfs/`
- Look at the browser console for any CORS errors

**Signature not appearing?**
- Make sure you clicked "Save Signature" in the modal
- Verify you're in Sign mode (green button)
- Check the browser console for errors

## Contributing

Found a bug? Have an idea for a new feature? Contributions are welcome!

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Future Ideas

Here are some features we'd love to add:
- [ ] Support for multiple pages
- [ ] Multiple signature fields per document
- [ ] Save and load templates
- [ ] User authentication
- [ ] Email delivery of signed PDFs
- [ ] Signature verification
- [ ] Custom branding options

## Questions or Feedback?

Feel free to open an issue or reach out. We'd love to hear how you're using this project!

---

**Happy Signing!** ✍️

Made with ❤️ by developers who got tired of printing and scanning PDFs.
