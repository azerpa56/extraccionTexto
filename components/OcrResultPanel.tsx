'use client';

import { Copy, Download, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { OcrResult } from '@/lib/ocr';
import { translateText, type TranslationLanguage } from '@/lib/translate';

interface OcrResultPanelProps {
  result: OcrResult | null;
}

export default function OcrResultPanel({ result }: OcrResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const [targetLang, setTargetLang] = useState<TranslationLanguage>('en');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [translationInfo, setTranslationInfo] = useState('');

  const languages: Array<{ value: TranslationLanguage; label: string }> = [
    { value: 'en', label: 'Inglés' },
    { value: 'es', label: 'Español' },
    { value: 'pt', label: 'Portugués' },
    { value: 'fr', label: 'Francés' },
    { value: 'it', label: 'Italiano' },
    { value: 'de', label: 'Alemán' },
  ];

  useEffect(() => {
    setTranslatedText('');
    setTranslationError('');
    setTranslationInfo('');
  }, [result?.text]);

  const handleCopy = async () => {
    const textToCopy = translatedText || result?.text || '';
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const textToDownload = translatedText || result?.text || '';
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `texto-${translatedText ? 'traducido' : 'extraido'}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTranslate = async () => {
    if (!result?.text?.trim()) {
      setTranslationError('Primero debes extraer texto para traducir.');
      return;
    }

    setIsTranslating(true);
    setTranslationError('');
    setTranslationInfo('');

    try {
      const translated = await translateText(result.text, targetLang);
      setTranslatedText(translated.translatedText);

      if (translated.mode === 'online') {
        setTranslationInfo('Traducción completada en línea.');
      } else {
        setTranslationInfo(translated.note || 'Modo offline activo: se muestra el texto original.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al traducir el texto';
      setTranslationError(`${message}. Verifica tu conexión a internet.`);
    } finally {
      setIsTranslating(false);
    }
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

          <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Traducción</p>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <select
                value={targetLang}
                onChange={(event) => setTargetLang(event.target.value as TranslationLanguage)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>

              <button
                onClick={handleTranslate}
                disabled={isTranslating || !result?.text?.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isTranslating ? 'Traduciendo...' : 'Traducir texto'}
              </button>
            </div>

            {translationError ? (
              <p className="mb-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                {translationError}
              </p>
            ) : null}

            {translationInfo ? (
              <p className="mb-2 rounded-lg border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800">
                {translationInfo}
              </p>
            ) : null}

            <div className="max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white p-3">
              <pre className="ocr-result-text whitespace-pre-wrap break-words text-sm text-slate-700">
                {translatedText || 'Aquí aparecerá el texto traducido.'}
              </pre>
            </div>
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
