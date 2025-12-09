import { useState, useRef, useEffect } from 'react';
import type { PdfField, FieldType, AppMode } from '../types';

interface DraggableFieldProps {
  field: PdfField;
  pageWidth: number;
  pageHeight: number;
  mode: AppMode;
  onUpdate: (field: PdfField) => void;
  onDelete: (fieldId: string) => void;
  onSignatureClick?: (fieldId: string) => void;
  signatureDataUrl?: string;
}

export const DraggableField: React.FC<DraggableFieldProps> = ({
  field,
  pageWidth,
  pageHeight,
  mode,
  onUpdate,
  onDelete,
  onSignatureClick,
  signatureDataUrl
}) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Convert normalized coordinates to pixels
  const left = field.xPct * pageWidth;
  const top = field.yPct * pageHeight;
  const width = field.wPct * pageWidth;
  const height = field.hPct * pageHeight;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'edit') return;
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - left,
      y: e.clientY - top
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'edit') return;
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newLeft = e.clientX - dragStart.x;
        const newTop = e.clientY - dragStart.y;

        // Clamp to page bounds
        const clampedLeft = Math.max(0, Math.min(newLeft, pageWidth - width));
        const clampedTop = Math.max(0, Math.min(newTop, pageHeight - height));

        onUpdate({
          ...field,
          xPct: clampedLeft / pageWidth,
          yPct: clampedTop / pageHeight
        });
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        const newWidth = Math.max(50, width + deltaX);
        const newHeight = Math.max(30, height + deltaY);

        // Clamp to page bounds
        const clampedWidth = Math.min(newWidth, pageWidth - left);
        const clampedHeight = Math.min(newHeight, pageHeight - top);

        onUpdate({
          ...field,
          wPct: clampedWidth / pageWidth,
          hPct: clampedHeight / pageHeight
        });

        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, field, pageWidth, pageHeight, width, height, left, top, onUpdate]);

  const getFieldLabel = (type: FieldType) => {
    switch (type) {
      case 'text': return 'Text';
      case 'signature': return 'Signature';
      case 'image': return 'Image';
      case 'date': return 'Date';
      case 'radio': return 'Radio';
      default: return 'Field';
    }
  };

  const handleFieldClick = () => {
    if (mode === 'sign' && field.type === 'signature' && onSignatureClick) {
      onSignatureClick(field.id);
    }
  };

  return (
    <div
      ref={fieldRef}
      className={`absolute border-2 ${
        mode === 'edit' 
          ? 'border-blue-500 bg-blue-50 cursor-move' 
          : field.type === 'signature' && !signatureDataUrl
          ? 'border-red-500 bg-red-50 cursor-pointer hover:bg-red-100'
          : 'border-green-500 bg-green-50'
      } ${isDragging ? 'opacity-50' : ''}`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleFieldClick}
    >
      {/* Field content */}
      <div className="flex items-center justify-center h-full text-xs font-semibold select-none">
        {mode === 'edit' ? (
          <span>{getFieldLabel(field.type)}</span>
        ) : field.type === 'signature' ? (
          signatureDataUrl ? (
            <img src={signatureDataUrl} alt="Signature" className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-red-600">Click to Sign</span>
          )
        ) : field.type === 'date' ? (
          <span>{new Date().toLocaleDateString()}</span>
        ) : (
          <span className="text-gray-400">{getFieldLabel(field.type)}</span>
        )}
      </div>

      {/* Delete button (edit mode only) */}
      {mode === 'edit' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(field.id);
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
        >
          ×
        </button>
      )}

      {/* Resize handle (edit mode only) */}
      {mode === 'edit' && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
          style={{ cursor: 'se-resize' }}
        />
      )}
    </div>
  );
};
