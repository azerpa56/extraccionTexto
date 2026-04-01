import { createWorker } from 'tesseract.js';

export type OcrEngine = 'tesseract' | 'google-vision';

export interface OcrResult {
  text: string;
  confidence?: number;
  engine: OcrEngine;
}

const GOOGLE_VISION_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY;

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

export async function extractTextWithGoogleVision(file: File): Promise<OcrResult> {
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

export async function extractTextWithTesseract(file: File): Promise<OcrResult> {
  const worker = await createWorker('spa+eng');

  try {
    const {
      data: { text, confidence },
    } = await worker.recognize(file);

    return {
      text: text?.trim() ?? '',
      confidence,
      engine: 'tesseract',
    };
  } finally {
    await worker.terminate();
  }
}

export async function extractText(file: File): Promise<OcrResult> {
  if (GOOGLE_VISION_API_KEY) {
    try {
      return await extractTextWithGoogleVision(file);
    } catch {
      // Fallback automático a Tesseract si falla Google Vision.
    }
  }

  return extractTextWithTesseract(file);
}
