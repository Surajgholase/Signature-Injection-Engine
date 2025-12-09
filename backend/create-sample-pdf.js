const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createSamplePdf() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();

    // Title
    page.drawText('Sample Document for Signature', {
        x: 50,
        y: height - 50,
        size: 24,
        font: boldFont,
        color: rgb(0, 0, 0)
    });

    // Content
    const content = [
        'This is a sample PDF document for testing the Signature Injection Engine.',
        '',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod',
        'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim',
        'veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea',
        'commodo consequat.',
        '',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum',
        'dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non',
        'proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        '',
        '',
        '',
        'Signature: _________________________________',
        '',
        'Date: _____________________',
    ];

    let yPosition = height - 100;
    content.forEach(line => {
        page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0, 0, 0)
        });
        yPosition -= 20;
    });

    const pdfBytes = await pdfDoc.save();

    const outputPath = path.join(__dirname, 'pdfs', 'sample-a4.pdf');
    fs.writeFileSync(outputPath, pdfBytes);

    console.log('✅ Sample PDF created at:', outputPath);
}

createSamplePdf().catch(console.error);
