'use client';

import { Copy, Download, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import type { OcrResult } from '@/lib/ocr';

interface OcrResultPanelProps {
  result: OcrResult | null;
}

export default function OcrResultPanel({ result }: OcrResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result?.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!result?.text) return;
    const blob = new Blob([result.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `texto-extraido-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Texto extraído</h3>
        {result ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Motor: {result.engine === 'google-vision' ? 'Google Vision' : 'Tesseract'}
          </span>
        ) : null}
      </div>

      {result ? (
        <>
          <div className="mb-3 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
            <pre className="ocr-result-text whitespace-pre-wrap break-words text-sm text-slate-700">
              {result.text || 'No se detectó texto en la imagen.'}
            </pre>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado' : 'Copiar texto'}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download size={16} />
              Descargar .txt
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          Carga o toma una foto para ver aquí el texto detectado.
        </div>
      )}
    </div>
  );
}
