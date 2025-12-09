# Quick Start Guide

## Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas account

## Step 1: Start MongoDB (if local)
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

## Step 2: Backend Setup
```bash
cd backend
npm install
node create-sample-pdf.js
npm run dev
```

Backend should now be running on `http://localhost:5000`

## Step 3: Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

Frontend should now be running on `http://localhost:5173`

## Step 4: Test the Application

1. Open `http://localhost:5173` in your browser
2. You should see the Signature Injection Engine interface
3. In **Edit Mode**:
   - Drag "Signature" from the left sidebar onto the PDF
   - Position and resize the signature field
4. Switch to **Sign Mode**:
   - Click on the signature field
   - Draw your signature
   - Click "Save Signature"
   - Click "Sign & Download"
5. Download your signed PDF!

## Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# If not installed, install MongoDB Community Edition:
# https://www.mongodb.com/try/download/community
```

### Port Already in Use
```bash
# Backend (port 5000)
# Kill the process using port 5000 or change PORT in backend/.env

# Frontend (port 5173)
# Vite will automatically use the next available port
```

### PDF Not Loading
- Ensure backend is running on port 5000
- Check `backend/pdfs/sample-a4.pdf` exists
- Check browser console for errors

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the codebase to understand the architecture
- Customize field types and styling
- Deploy to production!

---

**Need Help?** Check the main README.md for comprehensive documentation.
