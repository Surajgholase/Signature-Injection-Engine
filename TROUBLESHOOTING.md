# Troubleshooting Guide

Common issues and solutions for the Signature Injection Engine.

---

## 🔧 Installation Issues

### Issue: `npm install` fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and package-lock.json:**
   ```bash
   # Backend
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   
   # Frontend
   cd ../frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Use legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Update Node.js:**
   - Ensure you have Node.js 18+ installed
   - Download from: https://nodejs.org

---

## 🗄️ MongoDB Issues

### Issue: "MongoDB connection failed"

**Symptoms:**
```
⚠️  MongoDB connection failed (audit logging disabled): connect ECONNREFUSED
```

**Solutions:**

#### For Local MongoDB:

1. **Check if MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community@7.0
   
   # Linux
   sudo systemctl status mongod
   ```

2. **Verify MongoDB is installed:**
   ```bash
   mongod --version
   ```
   
   If not installed, see [MONGODB_SETUP.md](./MONGODB_SETUP.md)

3. **Check connection string in `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/signature-injection-engine
   ```

4. **Test connection manually:**
   ```bash
   mongosh mongodb://localhost:27017/signature-injection-engine
   ```

#### For MongoDB Atlas:

1. **Verify connection string format:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/signature-injection-engine?retryWrites=true&w=majority
   ```

2. **Check credentials:**
   - Username and password are correct
   - Password doesn't contain special characters (or is URL-encoded)

3. **Whitelist your IP:**
   - Go to MongoDB Atlas → Network Access
   - Add your current IP or use `0.0.0.0/0` (allow all) for testing

4. **Verify database user permissions:**
   - Go to Database Access
   - Ensure user has "Read and write to any database" role

5. **Test connection:**
   ```bash
   mongosh "mongodb+srv://username:password@cluster.xxxxx.mongodb.net/signature-injection-engine"
   ```

### Issue: "Authentication failed"

**Symptoms:**
```
MongoServerError: Authentication failed
```

**Solutions:**

1. **Check username and password:**
   - Verify credentials in MongoDB Atlas
   - Ensure password doesn't have special characters

2. **URL-encode password:**
   ```javascript
   // If password is: p@ssw0rd!
   // Encoded: p%40ssw0rd%21
   ```

3. **Recreate database user:**
   - Delete existing user in Atlas
   - Create new user with simple password
   - Update `.env` file

---

## 🖥️ Backend Issues

### Issue: Backend won't start

**Symptoms:**
```
Error: Cannot find module 'express'
```

**Solutions:**

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Check TypeScript compilation:**
   ```bash
   npm run build
   ```

3. **Verify `.env` file exists:**
   ```bash
   # Should exist in backend/.env
   ls -la .env
   ```

### Issue: "Port 5000 already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

1. **Kill process on port 5000:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   ```

2. **Change port in `.env`:**
   ```env
   PORT=5001
   ```
   
   Also update frontend `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5001/api
   ```

### Issue: "PDF not found: sample-a4"

**Symptoms:**
```
{
  "success": false,
  "error": "PDF not found: sample-a4"
}
```

**Solutions:**

1. **Generate sample PDF:**
   ```bash
   cd backend
   node create-sample-pdf.js
   ```

2. **Verify PDF exists:**
   ```bash
   ls pdfs/
   # Should show: sample-a4.pdf
   ```

3. **Check file permissions:**
   ```bash
   # Ensure the file is readable
   chmod 644 pdfs/sample-a4.pdf
   ```

### Issue: "Cannot write to signed/ directory"

**Symptoms:**
```
Error: ENOENT: no such file or directory, open '.../signed/signed-xxx.pdf'
```

**Solutions:**

1. **Create signed directory:**
   ```bash
   cd backend
   mkdir signed
   ```

2. **Check permissions:**
   ```bash
   chmod 755 signed
   ```

---

## 🎨 Frontend Issues

### Issue: Frontend won't start

**Symptoms:**
```
Error: Cannot find module 'vite'
```

**Solutions:**

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Issue: "Failed to fetch PDF"

**Symptoms:**
- PDF viewer shows loading spinner indefinitely
- Console error: `Failed to fetch`

**Solutions:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Check CORS settings:**
   - Backend should allow frontend origin
   - Verify `cors()` middleware in `backend/src/index.ts`

3. **Check API URL in frontend `.env`:**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Test PDF endpoint directly:**
   ```bash
   curl http://localhost:5000/api/pdfs/sample-a4 --output test.pdf
   ```

### Issue: "react-pdf not rendering"

**Symptoms:**
- Blank PDF viewer
- Console error: `Failed to load PDF`

**Solutions:**

1. **Install pdfjs-dist:**
   ```bash
   cd frontend
   npm install pdfjs-dist
   ```

2. **Check worker configuration:**
   - Verify `pdfjs.GlobalWorkerOptions.workerSrc` is set in `PdfViewer.tsx`

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### Issue: Tailwind CSS not working

**Symptoms:**
- No styling applied
- Plain HTML appearance

**Solutions:**

1. **Verify Tailwind is installed:**
   ```bash
   npm list tailwindcss
   ```

2. **Check `tailwind.config.js`:**
   ```javascript
   content: [
     "./index.html",
     "./src/**/*.{js,ts,jsx,tsx}",
   ]
   ```

3. **Verify `index.css` imports:**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. **Rebuild:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

---

## 🖱️ UI/UX Issues

### Issue: Can't drag fields

**Symptoms:**
- Fields don't move when dragged
- No visual feedback

**Solutions:**

1. **Verify you're in Edit mode:**
   - Mode toggle should show "📝 Edit" (yellow)

2. **Check browser console for errors:**
   - Open DevTools (F12)
   - Look for JavaScript errors

3. **Try different browser:**
   - Test in Chrome, Firefox, or Edge

### Issue: Signature pad not opening

**Symptoms:**
- Clicking signature field does nothing
- No modal appears

**Solutions:**

1. **Verify you're in Sign mode:**
   - Mode toggle should show "✍️ Sign" (green)

2. **Check if signature field exists:**
   - Switch to Edit mode
   - Verify signature field is on PDF

3. **Check browser console:**
   - Look for JavaScript errors

### Issue: Can't draw on signature pad

**Symptoms:**
- Canvas appears but drawing doesn't work
- No lines appear

**Solutions:**

1. **Check canvas initialization:**
   - Verify canvas element exists in DOM

2. **Try different input method:**
   - Use mouse instead of touch (or vice versa)

3. **Check browser compatibility:**
   - Canvas API should be supported in all modern browsers

### Issue: Signature doesn't appear in PDF

**Symptoms:**
- PDF downloads but signature is missing
- No errors shown

**Solutions:**

1. **Verify signature was saved:**
   - Check if signature preview appears in field

2. **Check backend logs:**
   - Look for errors in terminal running backend

3. **Verify field coordinates:**
   - Ensure field is within PDF bounds
   - Check MongoDB audit log for field data

---

## 📄 PDF Issues

### Issue: Signed PDF is corrupted

**Symptoms:**
- Can't open signed PDF
- "File is damaged" error

**Solutions:**

1. **Check backend logs for errors:**
   - Look for pdf-lib errors

2. **Verify original PDF is valid:**
   ```bash
   # Try opening original PDF
   open backend/pdfs/sample-a4.pdf
   ```

3. **Regenerate sample PDF:**
   ```bash
   cd backend
   node create-sample-pdf.js
   ```

4. **Check disk space:**
   - Ensure sufficient space for signed PDFs

### Issue: Signature position is wrong

**Symptoms:**
- Signature appears in wrong location
- Offset from expected position

**Solutions:**

1. **Check coordinate conversion:**
   - Verify `normalizeToPdfCoordinates()` in `pdfHelpers.ts`

2. **Verify PDF page size:**
   - Ensure PDF is A4 (595×842 points)
   - Check `create-sample-pdf.js` for page dimensions

3. **Test with different field positions:**
   - Try placing field in center of page

### Issue: Signature is distorted

**Symptoms:**
- Signature is stretched or squashed
- Aspect ratio not preserved

**Solutions:**

1. **Check aspect ratio preservation:**
   - Verify `fitSignatureInsideBox()` in `pdfHelpers.ts`

2. **Draw signature differently:**
   - Try drawing a simple signature
   - Avoid very wide or very tall signatures

3. **Check field dimensions:**
   - Ensure field has reasonable width/height ratio

---

## 🌐 Network Issues

### Issue: CORS errors

**Symptoms:**
```
Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solutions:**

1. **Verify CORS middleware:**
   ```typescript
   // backend/src/index.ts
   app.use(cors());
   ```

2. **Add specific origin:**
   ```typescript
   app.use(cors({
     origin: 'http://localhost:5173'
   }));
   ```

3. **Restart backend server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Issue: "Network error" when signing

**Symptoms:**
```
Network error. Please ensure the backend server is running.
```

**Solutions:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Check firewall settings:**
   - Ensure port 5000 is not blocked

3. **Test API endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/sign-pdf \
     -H "Content-Type: application/json" \
     -d '{"pdfId":"sample-a4","fields":[],"signatureImageBase64":""}'
   ```

---

## 🔐 Security Issues

### Issue: MongoDB exposed to internet

**Symptoms:**
- MongoDB accessible from any IP
- Security warning in Atlas

**Solutions:**

1. **Restrict IP access:**
   - Go to Atlas → Network Access
   - Remove `0.0.0.0/0` entry
   - Add only your specific IP

2. **Use VPN or static IP:**
   - For production, use static IP or VPN

3. **Enable authentication:**
   - Always use username/password
   - Use strong passwords

---

## 💻 Development Issues

### Issue: TypeScript errors

**Symptoms:**
```
error TS2304: Cannot find name 'Express'
```

**Solutions:**

1. **Install type definitions:**
   ```bash
   npm install --save-dev @types/express @types/node
   ```

2. **Check tsconfig.json:**
   - Verify `"moduleResolution": "node"`

3. **Restart TypeScript server:**
   - In VS Code: `Ctrl+Shift+P` → "Restart TS Server"

### Issue: Hot reload not working

**Symptoms:**
- Changes don't reflect in browser
- Need to manually refresh

**Solutions:**

1. **Restart dev server:**
   ```bash
   # Frontend
   npm run dev
   ```

2. **Check Vite config:**
   ```typescript
   // vite.config.ts
   server: {
     watch: {
       usePolling: true
     }
   }
   ```

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R`

---

## 🐛 Common Error Messages

### "Cannot read property 'map' of undefined"

**Cause:** Fields array is undefined

**Solution:**
```typescript
// Ensure fields is always an array
const [fields, setFields] = useState<PdfField[]>([]);
```

### "Failed to execute 'drawImage' on 'CanvasRenderingContext2D'"

**Cause:** Image not loaded or invalid

**Solution:**
- Verify signature data URL is valid
- Check image format (PNG/JPG only)

### "MongooseServerSelectionError: connect ETIMEDOUT"

**Cause:** Can't reach MongoDB server

**Solution:**
- Check internet connection (for Atlas)
- Verify MongoDB is running (for local)
- Check firewall settings

---

## 📊 Performance Issues

### Issue: Slow PDF signing

**Symptoms:**
- Takes > 10 seconds to sign PDF
- Browser freezes

**Solutions:**

1. **Reduce signature image size:**
   - Lower canvas resolution
   - Compress signature image

2. **Optimize PDF:**
   - Use smaller original PDF
   - Reduce number of fields

3. **Check server resources:**
   - Monitor CPU/memory usage
   - Ensure sufficient resources

### Issue: High memory usage

**Symptoms:**
- Browser tab uses > 500MB RAM
- System slows down

**Solutions:**

1. **Clear fields regularly:**
   - Use "Clear All Fields" button

2. **Reload page periodically:**
   - Refresh browser to clear memory

3. **Close unused tabs:**
   - Reduce overall browser memory usage

---

## 🔍 Debugging Tips

### Enable Verbose Logging

**Backend:**
```typescript
// backend/src/index.ts
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

**Frontend:**
```typescript
// Add console.logs in components
console.log('Fields:', fields);
console.log('Signature data:', signatureDataUrl);
```

### Use Browser DevTools

1. **Console:** Check for JavaScript errors
2. **Network:** Monitor API requests
3. **Application:** Check localStorage/cookies
4. **Performance:** Profile slow operations

### Check Backend Logs

```bash
# Run backend with verbose logging
DEBUG=* npm run dev
```

### MongoDB Debugging

```javascript
// Check audit logs
db.auditlogs.find().pretty()

// Count documents
db.auditlogs.countDocuments()

// Find recent logs
db.auditlogs.find().sort({ createdAt: -1 }).limit(5)
```

---

## 📞 Getting Help

If you're still stuck:

1. **Check documentation:**
   - [README.md](./README.md)
   - [MONGODB_SETUP.md](./MONGODB_SETUP.md)
   - [TESTING.md](./TESTING.md)

2. **Search for similar issues:**
   - Check GitHub issues (if applicable)
   - Search Stack Overflow

3. **Provide detailed information:**
   - OS and version
   - Node.js version
   - Browser and version
   - Full error message
   - Steps to reproduce

4. **Create minimal reproduction:**
   - Isolate the problem
   - Remove unnecessary code
   - Share code snippet

---

## ✅ Quick Diagnostic Checklist

Run through this checklist when troubleshooting:

- [ ] Node.js 18+ installed
- [ ] npm dependencies installed (backend & frontend)
- [ ] MongoDB running (local) or Atlas configured
- [ ] `.env` files exist and configured
- [ ] Sample PDF exists in `backend/pdfs/`
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] No errors in backend console
- [ ] No errors in browser console
- [ ] Can access `http://localhost:5000/api/health`
- [ ] Can access `http://localhost:5173`

---

**Still having issues?** Review the [TESTING.md](./TESTING.md) guide for comprehensive testing procedures.
