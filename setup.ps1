# Signature Injection Engine - Complete Setup Script
# This script automates the entire project setup process

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Signature Injection Engine - Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm installation
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm found: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm not found. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Navigate to backend
Set-Location -Path "backend"

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Backend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green

# Create .env file if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] Backend .env file created" -ForegroundColor Green
    Write-Host "[WARNING] Please update MONGODB_URI in backend/.env" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Backend .env file already exists" -ForegroundColor Green
}

# Generate sample PDF
Write-Host "Generating sample PDF..." -ForegroundColor Yellow
node create-sample-pdf.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Sample PDF generation failed" -ForegroundColor Red
} else {
    Write-Host "[OK] Sample PDF generated: pdfs/sample-a4.pdf" -ForegroundColor Green
}

# Create signed directory
if (-Not (Test-Path "signed")) {
    New-Item -ItemType Directory -Path "signed" | Out-Null
    Write-Host "[OK] Created signed/ directory" -ForegroundColor Green
}

# Navigate back to root
Set-Location -Path ".."

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Frontend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Navigate to frontend
Set-Location -Path "frontend"

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Frontend dependency installation failed" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}
Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green

# Create .env file if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    "VITE_API_BASE_URL=http://localhost:5000/api" | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "[OK] Frontend .env file created" -ForegroundColor Green
} else {
    Write-Host "[OK] Frontend .env file already exists" -ForegroundColor Green
}

# Navigate back to root
Set-Location -Path ".."

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Set up MongoDB (choose one option):" -ForegroundColor White
Write-Host "   Option A: MongoDB Atlas (Cloud - Recommended)" -ForegroundColor Cyan
Write-Host "   - Read MONGODB_SETUP.md for detailed instructions" -ForegroundColor Gray
Write-Host "   - Update backend/.env with your Atlas connection string" -ForegroundColor Gray
Write-Host ""
Write-Host "   Option B: Local MongoDB" -ForegroundColor Cyan
Write-Host "   - Install MongoDB from https://www.mongodb.com/try/download/community" -ForegroundColor Gray
Write-Host "   - Start MongoDB service" -ForegroundColor Gray
Write-Host "   - Connection string is already set in backend/.env" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Start the Backend Server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. Start the Frontend Server (in a new terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "   - README.md - Complete project documentation" -ForegroundColor Gray
Write-Host "   - MONGODB_SETUP.md - MongoDB setup guide" -ForegroundColor Gray
Write-Host "   - QUICKSTART.md - Quick start guide" -ForegroundColor Gray
Write-Host "   - DEPLOYMENT.md - Deployment instructions" -ForegroundColor Gray
Write-Host ""

Write-Host "Happy Signing!" -ForegroundColor Green
