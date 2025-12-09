# MongoDB Setup Guide

This guide will help you set up MongoDB for the Signature Injection Engine project. You have two options: **Local Installation** or **MongoDB Atlas (Cloud)**.

## Option 1: MongoDB Atlas (Cloud) - Recommended for Quick Start

MongoDB Atlas is a free cloud database service that requires no local installation.

### Steps:

1. **Create a Free Account**
   - Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
   - Sign up with your email or Google account

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Select **FREE** tier (M0 Sandbox)
   - Choose your preferred cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `signatureapp`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://signatureapp:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `signature-injection-engine`
     ```
     mongodb+srv://signatureapp:yourpassword@cluster0.xxxxx.mongodb.net/signature-injection-engine?retryWrites=true&w=majority
     ```

6. **Update Backend .env File**
   ```bash
   cd backend
   ```
   
   Edit `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://signatureapp:yourpassword@cluster0.xxxxx.mongodb.net/signature-injection-engine?retryWrites=true&w=majority
   NODE_ENV=development
   ```

7. **Test Connection**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   🚀 Server running on http://localhost:5000
   ✅ Connected to MongoDB
   ```

---

## Option 2: Local MongoDB Installation

### Windows Installation

1. **Download MongoDB Community Server**
   - Go to [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Select:
     - Version: Latest (7.0+)
     - Platform: Windows
     - Package: MSI
   - Click "Download"

2. **Install MongoDB**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool) - optional but helpful

3. **Verify Installation**
   ```powershell
   mongod --version
   ```
   
   You should see version information.

4. **Start MongoDB Service**
   
   MongoDB should start automatically as a Windows service. If not:
   ```powershell
   net start MongoDB
   ```

5. **Update Backend .env File**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/signature-injection-engine
   NODE_ENV=development
   ```

6. **Test Connection**
   ```bash
   cd backend
   npm run dev
   ```

### macOS Installation

1. **Install using Homebrew**
   ```bash
   # Install Homebrew if not already installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MongoDB
   brew tap mongodb/brew
   brew install mongodb-community@7.0
   ```

2. **Start MongoDB**
   ```bash
   brew services start mongodb-community@7.0
   ```

3. **Verify Installation**
   ```bash
   mongod --version
   ```

4. **Update Backend .env File**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/signature-injection-engine
   NODE_ENV=development
   ```

### Linux (Ubuntu/Debian) Installation

1. **Import MongoDB GPG Key**
   ```bash
   curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
      sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   ```

2. **Add MongoDB Repository**
   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
      sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Verify Installation**
   ```bash
   mongod --version
   ```

6. **Update Backend .env File**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/signature-injection-engine
   NODE_ENV=development
   ```

---

## Verify MongoDB Connection

After setting up MongoDB (either Atlas or local), verify the connection:

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check Console Output**
   
   ✅ **Success:**
   ```
   🚀 Server running on http://localhost:5000
   📁 Environment: development
   ✅ Connected to MongoDB
   ```
   
   ❌ **Failure:**
   ```
   🚀 Server running on http://localhost:5000
   📁 Environment: development
   ⚠️  MongoDB connection failed (audit logging disabled): ...
   💡 Server is running without MongoDB. Signature signing will work but audit logs won't be saved.
   ```

3. **Test Audit Logging**
   
   - Open the frontend: `http://localhost:5173`
   - Create a signature field in Edit mode
   - Switch to Sign mode
   - Draw a signature and click "Sign & Download"
   - Check MongoDB for the audit log entry

---

## MongoDB Compass (GUI Tool)

MongoDB Compass is a free GUI tool for viewing and managing your MongoDB data.

### Connect to Local MongoDB
- Connection String: `mongodb://localhost:27017`

### Connect to MongoDB Atlas
- Use the connection string from Atlas (without the database name)
- Example: `mongodb+srv://signatureapp:password@cluster0.xxxxx.mongodb.net/`

### View Audit Logs
1. Connect to your database
2. Select database: `signature-injection-engine`
3. Select collection: `auditlogs`
4. View all signed PDF records with hashes, fields, and metadata

---

## Troubleshooting

### Error: "MongoDB connection failed"

**For Local MongoDB:**
- Check if MongoDB service is running:
  ```bash
  # Windows
  net start MongoDB
  
  # macOS
  brew services start mongodb-community@7.0
  
  # Linux
  sudo systemctl status mongod
  ```

**For MongoDB Atlas:**
- Verify your connection string is correct
- Check that your IP is whitelisted (Network Access)
- Verify username and password are correct
- Ensure you replaced `<password>` with actual password

### Error: "Authentication failed"

- Double-check username and password in connection string
- Ensure the database user has proper permissions
- For Atlas: Verify the user exists in "Database Access"

### Error: "Network timeout"

- For Atlas: Check your internet connection
- For Atlas: Verify IP whitelist includes your current IP
- For Local: Ensure MongoDB service is running

### Server Works Without MongoDB

The application is designed to work without MongoDB:
- PDF signing functionality will work normally
- Audit logs won't be saved to database
- No error will prevent the application from running

---

## Production Considerations

### Security
- **Never commit** `.env` files with real credentials
- Use strong passwords for database users
- Restrict IP access to specific addresses in production
- Enable MongoDB authentication in production

### Performance
- Create indexes on frequently queried fields:
  ```javascript
  db.auditlogs.createIndex({ pdfId: 1 })
  db.auditlogs.createIndex({ createdAt: -1 })
  ```

### Backup
- For Atlas: Automatic backups are included in paid tiers
- For Local: Set up regular `mongodump` backups:
  ```bash
  mongodump --db signature-injection-engine --out /backup/path
  ```

### Monitoring
- Use MongoDB Atlas monitoring dashboard
- Set up alerts for connection issues
- Monitor disk space for local installations

---

## Next Steps

After MongoDB is set up:

1. ✅ Start the backend server: `cd backend && npm run dev`
2. ✅ Start the frontend server: `cd frontend && npm run dev`
3. ✅ Open `http://localhost:5173` in your browser
4. ✅ Test the complete signing workflow
5. ✅ Check MongoDB for audit log entries

---

**Need Help?** Check the main [README.md](./README.md) for complete project documentation.
