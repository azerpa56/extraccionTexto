export type OcrEngine = 'tesseract' | 'google-vision';

export interface OcrResult {
  text: string;
  confidence?: number;
  engine: OcrEngine;
}

const GOOGLE_VISION_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY;

export interface ExtractTextOptions {
  onProgress?: (message: string) => void;
}

async function preprocessImage(file: File): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('No se pudo inicializar el preprocesado de imagen');
  }

  const maxWidth = 2200;
  const ratio = Math.min(1, maxWidth / imageBitmap.width);
  canvas.width = Math.max(1, Math.round(imageBitmap.width * ratio));
  canvas.height = Math.max(1, Math.round(imageBitmap.height * ratio));

  ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const contrasted = gray > 150 ? 255 : Math.max(0, gray - 25);

    data[i] = contrasted;
    data[i + 1] = contrasted;
    data[i + 2] = contrasted;
  }

  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });

  if (!blob) {
    throw new Error('No se pudo preparar la imagen para OCR');
  }

  return blob;
}

async function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('No se pudo convertir la imagen a base64'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function extractTextWithGoogleVision(file: File, options?: ExtractTextOptions): Promise<OcrResult> {
  options?.onProgress?.('Enviando imagen a Google Vision...');

  if (!GOOGLE_VISION_API_KEY) {
    throw new Error('No se encontró NEXT_PUBLIC_GOOGLE_VISION_API_KEY');
  }

  const imageBase64 = await toBase64(file);

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
            imageContext: {
              languageHints: ['es', 'en'],
            },
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Vision API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const annotation = data.responses?.[0]?.fullTextAnnotation;
  const confidence = data.responses?.[0]?.textAnnotations?.[0]?.confidence;

  return {
    text: annotation?.text ?? '',
    confidence,
    engine: 'google-vision',
  };
}

export async function extractTextWithTesseract(file: File, options?: ExtractTextOptions): Promise<OcrResult> {
  options?.onProgress?.('Preparando imagen...');
  const preparedImage = await preprocessImage(file);

  options?.onProgress?.('Inicializando motor OCR...');
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('spa+eng', 1, {
    logger: (message) => {
      if (message.status === 'recognizing text') {
        const pct = Math.round((message.progress ?? 0) * 100);
        options?.onProgress?.(`Leyendo texto... ${pct}%`);
      }
    },
  });

  try {
    options?.onProgress?.('Analizando texto...');
    const {
      data: { text, confidence },
    } = await worker.recognize(preparedImage);

    return {
      text: text?.trim() ?? '',
      confidence,
      engine: 'tesseract',
    };
  } finally {
    await worker.terminate();
  }
}

export async function extractText(file: File, options?: ExtractTextOptions): Promise<OcrResult> {
  if (GOOGLE_VISION_API_KEY) {
    try {
      return await extractTextWithGoogleVision(file, options);
    } catch {
      // Fallback automático a Tesseract si falla Google Vision.
    }
  }

  return extractTextWithTesseract(file, options);
}
