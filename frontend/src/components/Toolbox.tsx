import React from 'react';
import type { ToolboxItem } from '../types';

interface ToolboxProps {
  items: ToolboxItem[];
}

export const Toolbox: React.FC<ToolboxProps> = ({ items }) => {
  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('fieldType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Toolbox</h2>
      <p className="text-sm text-gray-600 mb-4">
        Drag and drop fields onto the PDF
      </p>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg cursor-move hover:from-blue-100 hover:to-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-gray-700">
          <strong>Tip:</strong> In edit mode, you can drag fields to reposition them and resize using the handle in the bottom-right corner.
        </p>
      </div>
    </div>
  );
};
