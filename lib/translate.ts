export type TranslationLanguage = 'es' | 'en' | 'pt' | 'fr' | 'it' | 'de';

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: TranslationLanguage;
  mode: 'online' | 'offline-fallback';
  note?: string;
}

function offlineFallback(
  text: string,
  targetLanguage: TranslationLanguage,
  reason: string
): TranslationResult {
  return {
    translatedText: text,
    sourceLanguage: 'unknown',
    targetLanguage,
    mode: 'offline-fallback',
    note: reason,
  };
}

export async function translateText(
  text: string,
  targetLanguage: TranslationLanguage
): Promise<TranslationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('No hay texto para traducir');
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return offlineFallback(
      trimmed,
      targetLanguage,
      'Sin internet: se mantiene el texto original (modo offline).'
    );
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=auto|${targetLanguage}`;

  let response: Response;
  try {
    response = await fetch(url, { method: 'GET' });
  } catch {
    return offlineFallback(
      trimmed,
      targetLanguage,
      'No fue posible conectar al traductor en línea: se mantiene el texto original.'
    );
  }

  if (!response.ok) {
    return offlineFallback(
      trimmed,
      targetLanguage,
      'El servicio de traducción no respondió correctamente: se mantiene el texto original.'
    );
  }

  const data = await response.json();
  const translated = data?.responseData?.translatedText;

  if (!translated || typeof translated !== 'string') {
    return offlineFallback(
      trimmed,
      targetLanguage,
      'No se recibió una traducción válida: se mantiene el texto original.'
    );
  }

  return {
    translatedText: translated,
    sourceLanguage: data?.responseData?.match ? 'auto' : 'unknown',
    targetLanguage,
    mode: 'online',
  };
}
