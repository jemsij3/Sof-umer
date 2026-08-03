import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Check, Image as ImageIcon, AlertCircle, Eye } from 'lucide-react';

interface ReceiptUploadInputProps {
  referenceNumber: string;
  onReferenceChange: (val: string) => void;
  receiptFile: string;
  fileName?: string;
  fileType?: 'image' | 'pdf';
  fileSize?: number;
  onFileChange: (fileData: { url: string; fileType: 'image' | 'pdf'; fileName: string; fileSize: number } | null) => void;
  required?: boolean;
}

export const ReceiptUploadInput: React.FC<ReceiptUploadInputProps> = ({
  referenceNumber,
  onReferenceChange,
  receiptFile,
  fileName,
  fileType,
  fileSize,
  onFileChange,
  required = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (file: File) => {
    setError(null);
    if (!file) return;

    // Validate size
    if (file.size > MAX_SIZE) {
      setError(`File size exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller file.`);
      return;
    }

    // Validate type
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

    if (!isImage && !isPdf) {
      setError('Invalid format! Accepted formats: JPG, JPEG, PNG, WebP, PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onFileChange({
        url: result,
        fileType: isPdf ? 'pdf' : 'image',
        fileName: file.name,
        fileSize: file.size
      });
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const detectedFileType = fileType || (receiptFile.startsWith('data:application/pdf') || receiptFile.endsWith('.pdf') ? 'pdf' : 'image');

  return (
    <div className="space-y-4">
      {/* Option 1: TT / Transfer Reference Number */}
      <div>
        <label className="block text-[11px] font-bold text-white/70 uppercase mb-1.5 font-mono flex items-center justify-between">
          <span>1. TT / Transfer Reference Number</span>
          <span className="text-[10px] text-amber-400 font-normal">Method 1</span>
        </label>
        <input
          type="text"
          value={referenceNumber}
          onChange={(e) => onReferenceChange(e.target.value)}
          placeholder="e.g. CBE FT24081900123 / Telebirr TXN9988..."
          className="w-full p-3 bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-xl text-xs text-white font-mono placeholder-white/20 focus:outline-none transition"
        />
        <p className="text-[10px] text-white/40 mt-1">
          Enter the official transaction/transfer reference code from your bank or mobile banking app.
        </p>
      </div>

      {/* Option 2: Upload Payment Receipt File */}
      <div>
        <label className="block text-[11px] font-bold text-white/70 uppercase mb-1.5 font-mono flex items-center justify-between">
          <span>2. Upload Payment Receipt (Image or PDF)</span>
          <span className="text-[10px] text-amber-400 font-normal">Method 2 (Recommended)</span>
        </label>

        {!receiptFile ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-white/15 bg-black/40 hover:border-amber-500/50 hover:bg-white/[0.02]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Click or Drag & Drop Payment Receipt</p>
              <p className="text-[10px] text-white/40 mt-0.5 font-mono">
                Supports: JPG, JPEG, PNG, WebP, PDF (Max size: 10 MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {detectedFileType === 'pdf' ? (
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate font-mono">
                    {fileName || (detectedFileType === 'pdf' ? 'Payment_Receipt.pdf' : 'Payment_Receipt_Image')}
                  </p>
                  <p className="text-[10px] text-white/40 font-mono">
                    {detectedFileType === 'pdf' ? 'PDF Document' : 'Image File'} {fileSize ? `• ${formatFileSize(fileSize)}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => onFileChange(null)}
                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg cursor-pointer transition"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-place preview */}
            {detectedFileType === 'image' && (
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/80 max-h-[160px] flex justify-center items-center">
                <img
                  src={receiptFile}
                  alt="Receipt Preview"
                  className="max-h-[160px] object-contain"
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Full Modal Preview */}
      {previewOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-white">Uploaded Receipt Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-black/60 min-h-[300px]">
              {detectedFileType === 'pdf' ? (
                <iframe
                  src={receiptFile}
                  className="w-full h-[500px] rounded-xl border border-white/10"
                  title="PDF Receipt Preview"
                />
              ) : (
                <img
                  src={receiptFile}
                  alt="Enlarged Receipt"
                  className="max-h-[70vh] object-contain rounded-xl border border-white/10"
                />
              )}
            </div>
            <div className="p-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
