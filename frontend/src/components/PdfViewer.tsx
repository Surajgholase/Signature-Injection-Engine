import { useState } from 'react';
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

interface PageDimensions {
  width: number;
  height: number;
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
  const [pagesDimensions, setPagesDimensions] = useState<Record<number, PageDimensions>>({});

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page: any, pageIndex: number) => {
    const viewport = page.getViewport({ scale: 1 });
    setPagesDimensions(prev => ({
      ...prev,
      [pageIndex]: {
        width: viewport.width,
        height: viewport.height
      }
    }));
  };

  const handleDrop = (e: React.DragEvent, pageIndex: number) => {
    e.preventDefault();
    
    if (mode !== 'edit') return;

    const fieldType = e.dataTransfer.getData('fieldType') as FieldType;
    if (!fieldType) return;

    const dimensions = pagesDimensions[pageIndex];
    if (!dimensions) return;

    const container = e.currentTarget as HTMLDivElement;
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
      xPct: x / dimensions.width,
      yPct: y / dimensions.height,
      wPct: defaultWidth / dimensions.width,
      hPct: defaultHeight / dimensions.height
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
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex flex-col gap-8 items-center"
        >
          {Array.from(new Array(numPages), (_, index) => (
            <div
              key={`page_${index + 1}`}
              className="relative shadow-lg bg-white"
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
            >
              <Page
                pageNumber={index + 1}
                onLoadSuccess={(page) => onPageLoadSuccess(page, index)}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
              
              {pagesDimensions[index] && (
                <div
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{ 
                    width: `${pagesDimensions[index].width}px`, 
                    height: `${pagesDimensions[index].height}px` 
                  }}
                >
                  {fields
                    .filter(f => f.pageIndex === index)
                    .map(field => (
                      <div key={field.id} className="pointer-events-auto">
                        <DraggableField
                          field={field}
                          pageWidth={pagesDimensions[index].width}
                          pageHeight={pagesDimensions[index].height}
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
              <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-400 select-none">
                Page {index + 1} of {numPages}
              </div>
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
};

