import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Check, Image as ImageIcon, AlertCircle, Eye } from 'lucide-react';
import { useApp } from '../lib/AppContext';

interface ReceiptUploadInputProps {
  referenceNumber: string;
  onReferenceChange: (val: string) => void;
  receiptFile?: string;
  uploadedFile?: any;
  fileName?: string;
  fileType?: 'image' | 'pdf';
  fileSize?: number;
  onFileChange?: (fileData: { url: string; fileType: 'image' | 'pdf'; fileName: string; fileSize: number } | null) => void;
  onFileUploaded?: (fileData: any) => void;
  onFileRemoved?: () => void;
  required?: boolean;
}

export const ReceiptUploadInput: React.FC<ReceiptUploadInputProps> = ({
  referenceNumber,
  onReferenceChange,
  receiptFile: rawReceiptFile,
  uploadedFile,
  fileName: rawFileName,
  fileType: rawFileType,
  fileSize: rawFileSize,
  onFileChange,
  onFileUploaded,
  onFileRemoved,
  required = false
}) => {
  const { t } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Normalize file data from props
  const receiptFile = rawReceiptFile || (typeof uploadedFile === 'string' ? uploadedFile : uploadedFile?.url || '');
  const fileName = rawFileName || uploadedFile?.fileName || uploadedFile?.name || '';
  const fileSize = rawFileSize || uploadedFile?.fileSize || uploadedFile?.size;
  const fileType = rawFileType || uploadedFile?.fileType;

  const notifyChange = (data: { url: string; fileType: 'image' | 'pdf'; fileName: string; fileSize: number } | null) => {
    if (onFileChange) onFileChange(data);
    if (data && onFileUploaded) onFileUploaded(data);
    if (!data && onFileRemoved) onFileRemoved();
  };

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (file: File) => {
    setError(null);
    if (!file) return;

    // Validate size
    if (file.size > MAX_SIZE) {
      setError(t('file_size_exceeds', { size: (file.size / (1024 * 1024)).toFixed(1) }));
      return;
    }

    // Validate type
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

    if (!isImage && !isPdf) {
      setError(t('invalid_receipt_format'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      notifyChange({
        url: result,
        fileType: isPdf ? 'pdf' : 'image',
        fileName: file.name,
        fileSize: file.size
      });
    };
    reader.onerror = () => {
      setError(t('failed_read_file'));
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
        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5 font-mono flex items-center justify-between">
          <span>{t('tt_ref_number')}</span>
          <span className="text-[10px] text-[#C06853] font-normal">{t('method_1')}</span>
        </label>
        <input
          type="text"
          value={referenceNumber}
          onChange={(e) => onReferenceChange(e.target.value)}
          placeholder={t('tt_ref_number_placeholder')}
          className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 font-mono placeholder-stone-400 focus:outline-none transition shadow-xs"
        />
        <p className="text-[10px] text-stone-500 mt-1">
          {t('tt_ref_number_desc')}
        </p>
      </div>

      {/* Option 2: Upload Payment Receipt File */}
      <div>
        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5 font-mono flex items-center justify-between">
          <span>{t('upload_payment_receipt')}</span>
          <span className="text-[10px] text-[#C06853] font-normal">{t('method_2_recommended')}</span>
        </label>

        {!receiptFile ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[#C06853] bg-[#C06853]/10'
                : 'border-stone-300 bg-stone-50/50 hover:border-[#C06853]/50 hover:bg-[#C06853]/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-[#C06853]/10 border border-[#C06853]/20 flex items-center justify-center text-[#C06853]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">{t('drag_drop_receipt')}</p>
              <p className="text-[10px] text-stone-500 mt-0.5 font-mono">
                {t('supports_receipt_formats')}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl p-3.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {detectedFileType === 'pdf' ? (
                  <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#C06853]/10 border border-[#C06853]/20 flex items-center justify-center text-[#C06853] shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate font-mono">
                    {fileName || (detectedFileType === 'pdf' ? 'Payment_Receipt.pdf' : 'Payment_Receipt_Image')}
                  </p>
                  <p className="text-[10px] text-stone-500 font-mono">
                    {detectedFileType === 'pdf' ? t('pdf_document') : t('image_file')} {fileSize ? `• ${formatFileSize(fileSize)}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition"
                >
                  <Eye className="w-3.5 h-3.5" /> {t('preview')}
                </button>
                <button
                  type="button"
                  onClick={() => notifyChange(null)}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer transition border border-rose-200"
                  title={t('remove_file')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-place preview */}
            {detectedFileType === 'image' && (
              <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50 max-h-[160px] flex justify-center items-center">
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
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Full Modal Preview */}
      {previewOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C06853]" />
                <span className="text-sm font-bold text-stone-900">{t('uploaded_receipt_preview')}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-stone-100 min-h-[300px]">
              {detectedFileType === 'pdf' ? (
                <iframe
                  src={receiptFile}
                  className="w-full h-[500px] rounded-xl border border-stone-200"
                  title={t("pdf_receipt_preview")}
                />
              ) : (
                <img
                  src={receiptFile}
                  alt="Enlarged Receipt"
                  className="max-h-[70vh] object-contain rounded-xl border border-stone-200"
                />
              )}
            </div>
            <div className="p-3 border-t border-stone-200 flex justify-end bg-stone-50">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 bg-[#C06853] text-white font-extrabold text-xs rounded-xl cursor-pointer hover:bg-[#A85542] transition"
              >
                {t('close_preview')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
