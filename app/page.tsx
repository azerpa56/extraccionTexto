'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Languages, NotebookText, ScanText } from 'lucide-react';
import CameraCapture from '@/components/CameraCapture';
import FileUploader from '@/components/FileUploader';
import OcrResultPanel from '@/components/OcrResultPanel';
import { extractText, type OcrResult } from '@/lib/ocr';

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncOnlineStatus = () => setIsOnline(navigator.onLine);

    syncOnlineStatus();
    window.addEventListener('online', syncOnlineStatus);
    window.addEventListener('offline', syncOnlineStatus);

    return () => {
      window.removeEventListener('online', syncOnlineStatus);
      window.removeEventListener('offline', syncOnlineStatus);
    };
  }, []);

  const previewUrl = useMemo(() => {
    if (!selectedFile) return '';
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  const handleSelectFile = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError('');
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      setError('Primero debes seleccionar o tomar una foto.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setProgressMessage('Iniciando OCR...');

    try {
      const ocrResult = await extractText(selectedFile, {
        onProgress: (message) => setProgressMessage(message),
      });
      setResult(ocrResult);

      if (!ocrResult.text.trim()) {
        setError('No se detectó texto. Intenta con más luz o una foto más nítida.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al extraer el texto';
      setError(message);
    } finally {
      setIsProcessing(false);
      setProgressMessage('');
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 md:px-8">
      <section className="mb-8 rounded-3xl bg-white/80 p-6 shadow-sm backdrop-blur-md md:p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
            <NotebookText size={24} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Lector OCR de Hojas y Documentos
          </h1>
        </div>

        <p className="max-w-3xl text-sm text-slate-600 md:text-base">
          Toma una foto de una hoja de cuaderno o adjunta una imagen para extraer el texto.
          Funciona con texto impreso y también con escritura a mano.
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Motor activo: {process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY ? 'Google Vision (con fallback a Tesseract)' : 'Tesseract local'}
        </p>

        <div className="mt-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
            }`}
          >
            Estado de conexión: {isOnline ? 'Online' : 'Offline'}
          </span>
          {!isOnline ? (
            <p className="mt-2 text-xs text-amber-700">
              OCR local seguirá funcionando. La traducción intentará modo híbrido con fallback offline.
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <span className="inline-flex items-center gap-1">
              <ScanText size={14} /> OCR
            </span>
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <span className="inline-flex items-center gap-1">
              <Languages size={14} /> Español + Inglés
            </span>
          </span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <FileUploader onFileSelect={handleSelectFile} />
          <CameraCapture onCapture={handleSelectFile} />

          {selectedFile ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-slate-700">Imagen seleccionada:</p>
              <div className="relative overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="max-h-96 w-full object-contain bg-slate-50"
                />
              </div>
              <p className="mt-2 truncate text-xs text-slate-500">{selectedFile.name}</p>
            </div>
          ) : null}

          <button
            onClick={handleExtract}
            disabled={isProcessing || !selectedFile}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-base font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {progressMessage || 'Extrayendo texto...'}
              </>
            ) : (
              <>
                <ScanText size={18} />
                Extraer texto de la imagen
              </>
            )}
          </button>

          {error ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {error}
            </div>
          ) : null}
        </div>

        <div>
          <OcrResultPanel result={result} />
        </div>
      </section>
    </main>
  );
}
