import { useState } from 'react';
import { PdfViewer } from './components/PdfViewer';
import { Toolbox } from './components/Toolbox';
import { SignaturePad } from './components/SignaturePad';
import type { PdfField, AppMode, ToolboxItem, SignPdfRequest, SignPdfResponse } from './types';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const toolboxItems: ToolboxItem[] = [
  { type: 'text', label: 'Text Field', icon: '📝' },
  { type: 'signature', label: 'Signature', icon: '✍️' },
  { type: 'image', label: 'Image Box', icon: '🖼️' },
  { type: 'date', label: 'Date Field', icon: '📅' },
  { type: 'radio', label: 'Radio Button', icon: '🔘' }
];

function App() {
  const [mode, setMode] = useState<AppMode>('edit');
  const [fields, setFields] = useState<PdfField[]>([]);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [, setCurrentSignatureFieldId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const pdfId = 'sample-a4';
  const pdfUrl = `${API_BASE_URL}/pdfs/${pdfId}`;

  const handleModeToggle = () => {
    setMode(mode === 'edit' ? 'sign' : 'edit');
    setSignatureDataUrl('');
    setSignedPdfUrl('');
    setError('');
  };

  const handleSignatureClick = (fieldId: string) => {
    setCurrentSignatureFieldId(fieldId);
    setShowSignaturePad(true);
  };

  const handleSignatureSave = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
    setShowSignaturePad(false);
  };

  const handleSignAndDownload = async () => {
    if (!signatureDataUrl) {
      setError('Please add your signature before submitting.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const request: SignPdfRequest = {
        pdfId,
        fields,
        signatureImageBase64: signatureDataUrl
      };

      const response = await fetch(`${API_BASE_URL}/sign-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      const data: SignPdfResponse = await response.json();

      if (data.success && data.signedPdfUrl) {
        setSignedPdfUrl(data.signedPdfUrl);
        alert('PDF signed successfully! Click the download link below.');
      } else {
        setError(data.error || 'Failed to sign PDF');
      }
    } catch (err) {
      console.error('Error signing PDF:', err);
      setError('Network error. Please ensure the backend server is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFields = () => {
    if (confirm('Are you sure you want to clear all fields?')) {
      setFields([]);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Signature Injection Engine</h1>
            <p className="text-sm text-blue-100">Production-Ready PDF Signing Solution</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <span className="text-sm font-medium">Mode:</span>
              <button
                onClick={handleModeToggle}
                className={`px-4 py-1 rounded font-semibold transition ${
                  mode === 'edit'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-green-400 text-gray-900'
                }`}
              >
                {mode === 'edit' ? '📝 Edit' : '✍️ Sign'}
              </button>
            </div>

            {mode === 'edit' && fields.length > 0 && (
              <button
                onClick={handleClearFields}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded font-semibold transition"
              >
                Clear All Fields
              </button>
            )}

            {mode === 'sign' && (
              <button
                onClick={handleSignAndDownload}
                disabled={isProcessing || !signatureDataUrl}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Sign & Download'}
              </button>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {signedPdfUrl && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mx-4 mt-4 rounded">
          <strong>Success!</strong> Your PDF has been signed.{' '}
          <a
            href={signedPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold hover:text-green-900"
          >
            Download Signed PDF
          </a>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {mode === 'edit' && <Toolbox items={toolboxItems} />}
        
        <PdfViewer
          pdfUrl={pdfUrl}
          pdfId={pdfId}
          fields={fields}
          mode={mode}
          onFieldsChange={setFields}
          onSignatureClick={handleSignatureClick}
          signatureDataUrl={signatureDataUrl}
        />
      </div>

      {showSignaturePad && (
        <SignaturePad
          onSave={handleSignatureSave}
          onClose={() => setShowSignaturePad(false)}
        />
      )}

      <footer className="bg-gray-800 text-white text-center py-3 text-sm">
        <p>
          Built with React + TypeScript + Node.js + MongoDB | 
          Normalized Coordinates | SHA-256 Audit Logging
        </p>
      </footer>
    </div>
  );
}

export default App;
