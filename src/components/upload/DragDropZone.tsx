/**
 * Drag & Drop Zone Component
 *
 * Provides drag and drop file upload functionality
 */

import { useCallback, useState } from 'react';

interface DragDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

export function DragDropZone({
  onFileSelect,
  accept = '.json',
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false
}: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];

      // Validate file type
      if (accept && !file.name.endsWith(accept.replace('.', ''))) {
        alert(`Please upload a ${accept} file`);
        return;
      }

      // Validate file size
      if (maxSize && file.size > maxSize) {
        alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      onFileSelect(file);
    }
  }, [onFileSelect, accept, maxSize, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-12 text-center
        transition-all duration-200
        ${isDragOver
          ? 'border-av-primary bg-av-primary/10 scale-[1.02]'
          : 'border-gray-600 hover:border-av-primary/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        id="file-upload"
      />

      <div className="pointer-events-none">
        <svg
          className={`mx-auto h-16 w-16 mb-4 transition-colors ${
            isDragOver ? 'text-av-primary' : 'text-gray-500'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="text-lg font-medium text-gray-300 mb-2">
          {isDragOver ? 'Drop file here' : 'Drag & drop your data file'}
        </p>

        <p className="text-sm text-gray-500 mb-4">
          or click to browse
        </p>

        <p className="text-xs text-gray-600">
          Accepts {accept} files up to {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </div>
    </div>
  );
}
