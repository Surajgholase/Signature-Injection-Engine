# Testing Guide - Signature Injection Engine

This guide provides comprehensive testing procedures for the Signature Injection Engine.

## 🧪 Testing Checklist

### Prerequisites
- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend server running on `http://localhost:5173`
- [ ] MongoDB connected (check backend console for "✅ Connected to MongoDB")
- [ ] Sample PDF exists in `backend/pdfs/sample-a4.pdf`

---

## 1. Backend API Testing

### Test 1.1: Health Check
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-09T..."
}
```

### Test 1.2: PDF Retrieval
```bash
curl http://localhost:5000/api/pdfs/sample-a4 --output test.pdf
```

**Expected Result:**
- File `test.pdf` downloaded successfully
- File size > 0 bytes
- Can be opened in PDF viewer

### Test 1.3: PDF Signing API
```bash
curl -X POST http://localhost:5000/api/sign-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "pdfId": "sample-a4",
    "fields": [{
      "id": "sig-1",
      "pdfId": "sample-a4",
      "pageIndex": 0,
      "type": "signature",
      "xPct": 0.3,
      "yPct": 0.5,
      "wPct": 0.2,
      "hPct": 0.05
    }],
    "signatureImageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "signedPdfUrl": "http://localhost:5000/signed/signed-1733662000.pdf",
  "auditLogId": "...",
  "originalHash": "...",
  "signedHash": "..."
}
```

---

## 2. Frontend UI Testing

### Test 2.1: Application Load
1. Open `http://localhost:5173`
2. **Expected:**
   - Page loads without errors
   - Header displays "Signature Injection Engine"
   - PDF viewer shows sample PDF
   - Toolbox visible on left side (in Edit mode)
   - Mode toggle button shows "📝 Edit"

### Test 2.2: Edit Mode - Drag & Drop
1. Ensure you're in **Edit Mode** (yellow button)
2. Drag "✍️ Signature" from toolbox
3. Drop onto PDF canvas
4. **Expected:**
   - Field appears on PDF
   - Field has blue border
   - Field shows "Signature" label
   - Resize handle visible in bottom-right corner
   - Delete button (×) visible in top-right corner

### Test 2.3: Edit Mode - Field Positioning
1. Click and drag a field to move it
2. **Expected:**
   - Field moves smoothly
   - Position updates in real-time
   - Field stays within PDF bounds

### Test 2.4: Edit Mode - Field Resizing
1. Drag the blue resize handle in bottom-right corner
2. **Expected:**
   - Field resizes smoothly
   - Maintains aspect ratio constraints
   - Resize handle follows cursor

### Test 2.5: Edit Mode - Field Deletion
1. Click the red × button on a field
2. **Expected:**
   - Field is removed immediately
   - No errors in console

### Test 2.6: Edit Mode - Multiple Fields
1. Add 3-5 signature fields
2. Position them in different locations
3. Resize each to different sizes
4. **Expected:**
   - All fields render correctly
   - No overlap issues
   - Each field is independently draggable/resizable

### Test 2.7: Edit Mode - Clear All Fields
1. Add several fields
2. Click "Clear All Fields" button
3. Confirm the dialog
4. **Expected:**
   - All fields removed
   - Confirmation dialog appears
   - Button disappears when no fields exist

### Test 2.8: Mode Toggle
1. Click mode toggle button
2. **Expected:**
   - Mode changes from "📝 Edit" to "✍️ Sign"
   - Button color changes (yellow → green)
   - Toolbox disappears
   - Fields change appearance (blue → red borders)
   - "Sign & Download" button appears

### Test 2.9: Sign Mode - Signature Pad
1. Switch to Sign mode
2. Click on a signature field
3. **Expected:**
   - Modal popup appears
   - Canvas is visible
   - "Clear" and "Save Signature" buttons visible
   - × close button in top-right

### Test 2.10: Sign Mode - Draw Signature
1. Open signature pad
2. Draw a signature on canvas (click and drag)
3. **Expected:**
   - Drawing appears in real-time
   - Lines are smooth
   - Black color on white background

### Test 2.11: Sign Mode - Clear Signature
1. Draw a signature
2. Click "Clear" button
3. **Expected:**
   - Canvas clears completely
   - Ready to draw again

### Test 2.12: Sign Mode - Save Signature
1. Draw a signature
2. Click "Save Signature"
3. **Expected:**
   - Modal closes
   - Signature preview appears in the field
   - "Sign & Download" button becomes enabled

### Test 2.13: Sign Mode - Sign & Download
1. Draw and save a signature
2. Click "Sign & Download" button
3. **Expected:**
   - Button shows "Processing..." briefly
   - Success message appears
   - Download link is provided
   - Link opens signed PDF in new tab

### Test 2.14: Error Handling - No Signature
1. Switch to Sign mode
2. Click "Sign & Download" without drawing signature
3. **Expected:**
   - Error message: "Please add your signature before submitting."
   - No PDF generated

### Test 2.15: Error Handling - Backend Offline
1. Stop backend server
2. Try to sign a PDF
3. **Expected:**
   - Error message: "Network error. Please ensure the backend server is running."
   - No crash or freeze

---

## 3. MongoDB Testing

### Test 3.1: Audit Log Creation
1. Sign a PDF successfully
2. Check MongoDB database
3. **Expected:**
   - New document in `auditlogs` collection
   - Contains: `pdfId`, `originalHash`, `signedHash`, `fields`, `signerMeta`, `createdAt`

**MongoDB Compass Query:**
```javascript
db.auditlogs.find().sort({ createdAt: -1 }).limit(1)
```

**Expected Document Structure:**
```json
{
  "_id": "...",
  "pdfId": "sample-a4",
  "originalHash": "a3b5c7d9...",
  "signedHash": "e1f2g3h4...",
  "fields": [
    {
      "id": "sig-...",
      "pdfId": "sample-a4",
      "pageIndex": 0,
      "type": "signature",
      "xPct": 0.3,
      "yPct": 0.5,
      "wPct": 0.2,
      "hPct": 0.05
    }
  ],
  "signerMeta": {
    "ip": "::1",
    "userAgent": "Mozilla/5.0..."
  },
  "createdAt": "2025-12-09T..."
}
```

### Test 3.2: Hash Verification
1. Sign the same PDF twice with different signatures
2. Check MongoDB
3. **Expected:**
   - `originalHash` is identical for both
   - `signedHash` is different for each
   - Both hashes are 64-character hex strings

### Test 3.3: Field Coordinate Storage
1. Create a field at specific position (e.g., 30% from left, 50% from top)
2. Sign the PDF
3. Check MongoDB audit log
4. **Expected:**
   - `xPct` ≈ 0.3
   - `yPct` ≈ 0.5
   - All percentage values between 0 and 1

---

## 4. PDF Output Testing

### Test 4.1: Signed PDF Download
1. Sign a PDF
2. Click download link
3. Open in PDF viewer
4. **Expected:**
   - PDF opens without errors
   - Signature appears in correct position
   - Signature is clear and visible
   - PDF is not corrupted

### Test 4.2: Signature Position Accuracy
1. Place signature field at specific location in Edit mode
2. Sign and download PDF
3. **Expected:**
   - Signature appears exactly where field was placed
   - No offset or misalignment
   - Signature fits within field boundaries

### Test 4.3: Signature Aspect Ratio
1. Create a wide signature field (e.g., 200px × 50px)
2. Draw a tall signature
3. Sign and download
4. **Expected:**
   - Signature is scaled to fit
   - Aspect ratio is preserved
   - Signature is centered in field
   - No distortion

### Test 4.4: Multiple Signatures
1. Create 3 signature fields
2. Sign all three (same signature)
3. Download PDF
4. **Expected:**
   - All three signatures appear
   - All are in correct positions
   - All are properly scaled

### Test 4.5: File Integrity
1. Sign a PDF
2. Download the signed PDF
3. Calculate SHA-256 hash of downloaded file
4. Compare with `signedHash` in MongoDB
5. **Expected:**
   - Hashes match exactly
   - Confirms file integrity

**Calculate hash (PowerShell):**
```powershell
Get-FileHash -Path "signed-1733662000.pdf" -Algorithm SHA256
```

---

## 5. Responsive Design Testing

### Test 5.1: Desktop (1920×1080)
1. Open app in full-screen browser
2. Test all features
3. **Expected:**
   - All elements visible
   - No horizontal scrolling
   - PDF viewer uses available space
   - Fields are easy to manipulate

### Test 5.2: Tablet (768×1024)
1. Resize browser to tablet size
2. Test drag & drop
3. **Expected:**
   - Layout adjusts appropriately
   - Toolbox remains accessible
   - Fields still draggable
   - Buttons remain clickable

### Test 5.3: Mobile (375×667)
1. Resize browser to mobile size
2. Test signature pad
3. **Expected:**
   - Signature pad fills screen
   - Canvas is touch-friendly
   - Buttons are large enough
   - No layout overflow

### Test 5.4: Zoom Testing
1. Zoom browser to 150%
2. Test all features
3. **Expected:**
   - No layout breaks
   - All text readable
   - Buttons still clickable
   - PDF viewer scales correctly

---

## 6. Performance Testing

### Test 6.1: Large Signature Image
1. Draw a complex signature (many strokes)
2. Sign PDF
3. **Expected:**
   - Processing completes in < 5 seconds
   - No browser freeze
   - PDF downloads successfully

### Test 6.2: Multiple Fields (10+)
1. Add 10+ signature fields
2. Sign PDF
3. **Expected:**
   - All signatures render correctly
   - Processing time reasonable (< 10 seconds)
   - No memory issues

### Test 6.3: Rapid Mode Switching
1. Switch between Edit and Sign modes rapidly (10 times)
2. **Expected:**
   - No errors
   - No memory leaks
   - UI remains responsive

---

## 7. Edge Cases & Error Handling

### Test 7.1: Empty Signature
1. Open signature pad
2. Click "Save Signature" without drawing
3. **Expected:**
   - Warning or error message
   - Modal doesn't close
   - OR: Allows saving but shows error on submit

### Test 7.2: Invalid PDF ID
1. Manually change `pdfId` in code to non-existent file
2. Try to load app
3. **Expected:**
   - Error message displayed
   - No crash
   - Helpful error text

### Test 7.3: Network Interruption
1. Start signing process
2. Disable network mid-request
3. **Expected:**
   - Timeout error after reasonable time
   - Error message displayed
   - App remains functional

### Test 7.4: MongoDB Disconnection
1. Stop MongoDB service
2. Try to sign a PDF
3. **Expected:**
   - PDF signing still works
   - Warning in backend console
   - Audit log not saved (graceful degradation)

### Test 7.5: Concurrent Signing
1. Open app in two browser tabs
2. Sign PDFs simultaneously
3. **Expected:**
   - Both complete successfully
   - Separate audit logs created
   - No race conditions

---

## 8. Browser Compatibility Testing

Test in multiple browsers:

### Chrome/Edge
- [ ] All features work
- [ ] Signature pad smooth
- [ ] PDF renders correctly

### Firefox
- [ ] All features work
- [ ] Signature pad smooth
- [ ] PDF renders correctly

### Safari (if available)
- [ ] All features work
- [ ] Signature pad smooth
- [ ] PDF renders correctly

---

## 9. Security Testing

### Test 9.1: XSS Prevention
1. Try injecting `<script>alert('XSS')</script>` in field IDs
2. **Expected:**
   - Script doesn't execute
   - Content is escaped

### Test 9.2: SQL Injection (MongoDB)
1. Try injecting MongoDB operators in API requests
2. **Expected:**
   - Input is sanitized
   - No database errors
   - No unauthorized access

### Test 9.3: File Upload Size Limit
1. Try uploading extremely large signature image (> 50MB)
2. **Expected:**
   - Request rejected
   - Error message displayed
   - Server doesn't crash

---

## 10. Regression Testing

After any code changes, run this quick checklist:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] MongoDB connects successfully
- [ ] PDF loads in viewer
- [ ] Can add signature field
- [ ] Can draw signature
- [ ] Can sign and download PDF
- [ ] Audit log created in MongoDB
- [ ] No console errors

---

## Automated Testing (Future Enhancement)

### Backend Unit Tests (Jest)
```javascript
describe('PDF Controller', () => {
  test('should sign PDF with valid input', async () => {
    // Test implementation
  });
});
```

### Frontend Component Tests (React Testing Library)
```javascript
describe('SignaturePad', () => {
  test('should render canvas', () => {
    // Test implementation
  });
});
```

### End-to-End Tests (Playwright/Cypress)
```javascript
test('complete signing workflow', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Test implementation
});
```

---

## Bug Reporting Template

When reporting bugs, include:

```markdown
**Environment:**
- OS: Windows 11
- Browser: Chrome 120
- Node.js: v18.17.0
- MongoDB: Atlas / Local v7.0

**Steps to Reproduce:**
1. Open app
2. Click signature field
3. ...

**Expected Behavior:**
Signature should appear in PDF

**Actual Behavior:**
Error message displayed

**Console Errors:**
```
Error: ...
```

**Screenshots:**
[Attach screenshot]
```

---

## Testing Metrics

Track these metrics for quality assurance:

- **Test Coverage:** Aim for 80%+ code coverage
- **Bug Density:** < 1 bug per 1000 lines of code
- **Performance:** PDF signing < 5 seconds
- **Uptime:** 99.9% server availability
- **User Satisfaction:** Based on feedback

---

## Continuous Integration (CI)

Recommended CI pipeline:

1. **Lint:** ESLint for code quality
2. **Type Check:** TypeScript compilation
3. **Unit Tests:** Jest tests
4. **Build:** Production build
5. **E2E Tests:** Playwright tests
6. **Deploy:** Automatic deployment on success

---

**Happy Testing! 🧪**

For issues or questions, refer to the main [README.md](./README.md) or [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
