'use client';

import { useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, UploadCloud } from 'lucide-react';
import clsx from 'clsx';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const [file] = acceptedFiles;
      if (file) onFileSelect(file);
    },
  });

  const label = useMemo(() => {
    if (isDragActive) return 'Suelta la imagen aquí...';
    return 'Arrastra una imagen o haz click para adjuntar';
  }, [isDragActive]);

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'cursor-pointer rounded-2xl border-2 border-dashed p-6 transition',
        'bg-white shadow-sm',
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="rounded-full bg-slate-100 p-3">
          {isDragActive ? <UploadCloud size={28} className="text-blue-600" /> : <ImagePlus size={28} className="text-slate-600" />}
        </div>

        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-500">Formatos: JPG, PNG, WEBP, BMP, TIFF</p>
      </div>
    </div>
  );
}
