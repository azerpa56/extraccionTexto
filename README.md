# App de lectura de imágenes (OCR)

Aplicación web en Next.js para:
- Tomar foto con cámara
- Adjuntar imágenes
- Extraer texto impreso y manuscrito (mejorado con Google Vision opcional)

## Requisitos
- Node.js 18 o superior

## Instalación
```bash
npm install
```

## Variables de entorno (opcional, recomendado para escritura a mano)
1. Copia `.env.local.example` a `.env.local`
2. Coloca tu API key de Google Vision:
```bash
NEXT_PUBLIC_GOOGLE_VISION_API_KEY=tu_api_key
```

Si no configuras la API key, la app usa Tesseract.js local.

## Ejecutar en desarrollo
```bash
npm run dev
```

Abre http://localhost:3000

## Notas
- Para escritura a mano, Google Vision suele dar mejores resultados.
- Toma fotos con buena iluminación y enfoque para mayor precisión.
