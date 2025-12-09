import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PdfField, FieldType, AppMode } from '../types';
import { DraggableField } from './DraggableField';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfViewerProps {
  pdfUrl: string;
  pdfId: string;
  fields: PdfField[];
  mode: AppMode;
  onFieldsChange: (fields: PdfField[]) => void;
  onSignatureClick?: (fieldId: string) => void;
  signatureDataUrl?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  pdfId,
  fields,
  mode,
  onFieldsChange,
  onSignatureClick,
  signatureDataUrl
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageWidth(viewport.width);
    setPageHeight(viewport.height);
  };

  const handleDrop = (e: React.DragEvent, pageIndex: number) => {
    e.preventDefault();
    
    if (mode !== 'edit') return;

    const fieldType = e.dataTransfer.getData('fieldType') as FieldType;
    if (!fieldType) return;

    const container = pageContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Default field size
    const defaultWidth = 150;
    const defaultHeight = 50;

    const newField: PdfField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pdfId,
      pageIndex,
      type: fieldType,
      xPct: x / pageWidth,
      yPct: y / pageHeight,
      wPct: defaultWidth / pageWidth,
      hPct: defaultHeight / pageHeight
    };

    onFieldsChange([...fields, newField]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateField = (updatedField: PdfField) => {
    const updatedFields = fields.map(f => 
      f.id === updatedField.id ? updatedField : f
    );
    onFieldsChange(updatedFields);
  };

  const deleteField = (fieldId: string) => {
    const updatedFields = fields.filter(f => f.id !== fieldId);
    onFieldsChange(updatedFields);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="shadow-lg"
        >
          <div
            ref={pageContainerRef}
            className="relative inline-block bg-white"
            onDrop={(e) => handleDrop(e, pageNumber - 1)}
            onDragOver={handleDragOver}
          >
            <Page
              pageNumber={pageNumber}
              onLoadSuccess={onPageLoadSuccess}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
            
            {pageWidth > 0 && pageHeight > 0 && (
              <div
                className="absolute top-0 left-0 pointer-events-none"
                style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}
              >
                {fields
                  .filter(f => f.pageIndex === pageNumber - 1)
                  .map(field => (
                    <div key={field.id} className="pointer-events-auto">
                      <DraggableField
                        field={field}
                        pageWidth={pageWidth}
                        pageHeight={pageHeight}
                        mode={mode}
                        onUpdate={updateField}
                        onDelete={deleteField}
                        onSignatureClick={onSignatureClick}
                        signatureDataUrl={signatureDataUrl}
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </Document>

        {numPages > 1 && (
          <div className="mt-4 text-center text-gray-600">
            Page {pageNumber} of {numPages}
          </div>
        )}
      </div>
    </div>
  );
};
