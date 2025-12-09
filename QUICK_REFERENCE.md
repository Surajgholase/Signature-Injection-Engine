# Quick Reference - Signature Injection Engine

## 🚀 Quick Start (3 Steps)

### 1. Setup MongoDB
```bash
# Option A: MongoDB Atlas (Recommended)
# - Go to https://www.mongodb.com/cloud/atlas
# - Create free account and cluster
# - Get connection string
# - Update backend/.env

# Option B: Local MongoDB
# - Install from https://www.mongodb.com/try/download/community
# - Start service: net start MongoDB (Windows)
```

### 2. Start Backend
```bash
cd backend
npm install
npm run dev
# Should see: ✅ Connected to MongoDB
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Open: http://localhost:5173
```

---

## 📝 Common Commands

### Backend
```bash
cd backend
npm install              # Install dependencies
npm run dev              # Start dev server (port 5000)
npm run build            # Compile TypeScript
npm start                # Run production build
node create-sample-pdf.js  # Generate sample PDF
```

### Frontend
```bash
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server (port 5173)
npm run build            # Build for production
npm run preview          # Preview production build
```

### MongoDB
```bash
# Windows
net start MongoDB        # Start service
net stop MongoDB         # Stop service

# macOS
brew services start mongodb-community@7.0
brew services stop mongodb-community@7.0

# Linux
sudo systemctl start mongod
sudo systemctl stop mongod
```

---

## 🌐 URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health
- **Sample PDF:** http://localhost:5000/api/pdfs/sample-a4

---

## 📁 Key Files

### Configuration
- `backend/.env` - Backend environment variables
- `frontend/.env` - Frontend environment variables
- `backend/tsconfig.json` - TypeScript config (backend)
- `frontend/tsconfig.json` - TypeScript config (frontend)
- `frontend/tailwind.config.js` - Tailwind CSS config

### Source Code
- `backend/src/index.ts` - Express server
- `backend/src/controllers/pdfController.ts` - PDF signing logic
- `backend/src/models/AuditLog.ts` - MongoDB schema
- `backend/src/utils/pdfHelpers.ts` - Coordinate conversion
- `frontend/src/App.tsx` - Main React component
- `frontend/src/components/PdfViewer.tsx` - PDF renderer
- `frontend/src/components/SignaturePad.tsx` - Signature canvas

### Documentation
- `README.md` - Complete documentation
- `MONGODB_SETUP.md` - MongoDB setup guide
- `TESTING.md` - Testing procedures
- `TROUBLESHOOTING.md` - Common issues
- `DEPLOYMENT.md` - Deployment guide
- `COMPLETION.md` - Project summary

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/signature-injection-engine
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🎯 Usage Flow

### Edit Mode (Create Template)
1. Ensure "Edit" mode is active (yellow button)
2. Drag "Signature" field from sidebar onto PDF
3. Position and resize the field
4. Add more fields as needed

### Sign Mode (Sign PDF)
1. Toggle to "Sign" mode (green button)
2. Click on signature field
3. Draw signature on canvas
4. Click "Save Signature"
5. Click "Sign & Download"
6. Download signed PDF

---

## 🐛 Troubleshooting Quick Fixes

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json .vite
npm install
npm run dev
```

### MongoDB connection failed
```bash
# Check if MongoDB is running
net start MongoDB  # Windows
brew services start mongodb-community@7.0  # macOS
sudo systemctl start mongod  # Linux

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env
```

### Port already in use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### PDF not found
```bash
cd backend
node create-sample-pdf.js
```

---

## 📊 API Endpoints

### GET /api/health
```bash
curl http://localhost:5000/api/health
```

### GET /api/pdfs/:pdfId
```bash
curl http://localhost:5000/api/pdfs/sample-a4 --output test.pdf
```

### POST /api/sign-pdf
```bash
curl -X POST http://localhost:5000/api/sign-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "pdfId": "sample-a4",
    "fields": [...],
    "signatureImageBase64": "data:image/png;base64,..."
  }'
```

---

## 🗄️ MongoDB Quick Commands

### Using MongoDB Compass
1. Connect to: `mongodb://localhost:27017`
2. Database: `signature-injection-engine`
3. Collection: `auditlogs`

### Using mongosh
```bash
# Connect
mongosh mongodb://localhost:27017/signature-injection-engine

# View audit logs
db.auditlogs.find().pretty()

# Count documents
db.auditlogs.countDocuments()

# Find recent logs
db.auditlogs.find().sort({ createdAt: -1 }).limit(5)

# Delete all logs (testing only)
db.auditlogs.deleteMany({})
```

---

## 🔍 Debugging

### Check Backend Logs
```bash
cd backend
npm run dev
# Watch console for errors
```

### Check Frontend Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors

### Check MongoDB Connection
```bash
mongosh mongodb://localhost:27017/signature-injection-engine
# Should connect without errors
```

---

## 📦 Dependencies

### Backend
- express - Web framework
- mongoose - MongoDB ODM
- pdf-lib - PDF manipulation
- cors - CORS support
- dotenv - Environment variables
- multer - File upload

### Frontend
- react - UI framework
- react-pdf - PDF rendering
- pdfjs-dist - PDF.js library
- tailwindcss - Styling
- vite - Build tool
- typescript - Type safety

---

## 🎨 Project Structure

```
signature-injection-engine/
├── backend/           # Node.js + Express + MongoDB
│   ├── src/          # TypeScript source code
│   ├── pdfs/         # Original PDFs
│   └── signed/       # Signed PDFs output
│
├── frontend/         # React + TypeScript + Vite
│   ├── src/         # React components
│   └── public/      # Static assets
│
└── docs/            # Documentation
    ├── README.md
    ├── MONGODB_SETUP.md
    ├── TESTING.md
    ├── TROUBLESHOOTING.md
    └── DEPLOYMENT.md
```

---

## ✅ Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] MongoDB connects successfully
- [ ] PDF loads in viewer
- [ ] Can drag signature field onto PDF
- [ ] Can resize signature field
- [ ] Can draw signature on canvas
- [ ] Can sign and download PDF
- [ ] Audit log created in MongoDB
- [ ] No console errors

---

## 🚢 Deployment

### Backend (Heroku)
```bash
cd backend
heroku create your-app-name
heroku config:set MONGODB_URI=your-atlas-uri
git push heroku main
```

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 📚 Documentation Links

- **[README.md](./README.md)** - Complete project documentation
- **[MONGODB_SETUP.md](./MONGODB_SETUP.md)** - MongoDB setup guide
- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues & solutions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructions
- **[COMPLETION.md](./COMPLETION.md)** - Project completion summary
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide

---

## 💡 Tips

1. **Always check MongoDB connection** - Look for "✅ Connected to MongoDB" in backend console
2. **Use MongoDB Atlas for easy setup** - No local installation required
3. **Clear browser cache** if UI doesn't update - Ctrl+Shift+R
4. **Check both consoles** - Backend terminal and browser DevTools
5. **Regenerate sample PDF** if it's missing - `node create-sample-pdf.js`

---

## 🆘 Need Help?

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review [TESTING.md](./TESTING.md)
3. Read [MONGODB_SETUP.md](./MONGODB_SETUP.md)
4. Check backend and frontend console logs
5. Verify all environment variables are set

---

**Quick Setup Command:**
```bash
powershell -ExecutionPolicy Bypass -File setup.ps1
```

**Happy Signing!** ✍️
