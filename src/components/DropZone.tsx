import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropZoneProps {
  onImageDrop: (dataUrl: string) => void;
  compact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onImageDrop, compact }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageDrop(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    },
    [onImageDrop]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [], 'image/webp': [] },
    multiple: false,
    onDragEnter: () => setIsDraggingOver(true),
    onDragLeave: () => setIsDraggingOver(false),
    onDropAccepted: () => setIsDraggingOver(false),
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed cursor-pointer transition-all duration-200"
        style={{
          borderColor: isDraggingOver ? 'var(--color-primary)' : 'var(--color-border)',
          background: isDraggingOver ? 'var(--color-primary-glow)' : 'var(--color-surface)',
          color: isDraggingOver ? 'var(--color-primary)' : 'var(--color-text-subtle)',
          fontSize: 13,
        }}
      >
        <input {...getInputProps()} />
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span>Upload screenshot</span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 z-10"
      style={{
        background: isDraggingOver
          ? 'rgba(99,102,241,0.15)'
          : 'rgba(8,12,20,0.7)',
        backdropFilter: 'blur(4px)',
        border: isDraggingOver ? '2px dashed var(--color-primary)' : '2px dashed transparent',
        borderRadius: 16,
      }}
    >
      <input {...getInputProps()} />
      <div
        className="flex flex-col items-center gap-4 transition-transform duration-300"
        style={{ transform: isDraggingOver ? 'scale(1.05)' : 'scale(1)' }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: isDraggingOver ? 'var(--color-primary-glow)' : 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
            {isDraggingOver ? 'Release to upload' : 'Drop your screenshot here'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            PNG, JPG, WebP — or <span style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>browse files</span>
          </p>
        </div>
      </div>
    </div>
  );
};
