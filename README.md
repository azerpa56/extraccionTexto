# App de lectura de imágenes (OCR)

Aplicación web en Next.js para:
- Tomar foto con cámara
- Adjuntar imágenes
- Extraer texto impreso y manuscrito (mejorado con Google Vision opcional)
- Traducir el texto extraído (servicio en línea)
- Instalarse como app (PWA)

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

## Instalar como app (PWA)
- En Android (Chrome): menú del navegador > "Instalar aplicación".
- En PC (Chrome/Edge): icono de instalar en la barra de direcciones.
- iPhone (Safari): Compartir > "Agregar a pantalla de inicio".

## Notas
- Para escritura a mano, Google Vision suele dar mejores resultados.
- Toma fotos con buena iluminación y enfoque para mayor precisión.
- La traducción necesita internet (usa API en línea).
- OCR con Tesseract puede funcionar sin internet una vez cargada la app.
- Modo híbrido de traducción: intenta traducir en línea y, si no hay conexión, mantiene el texto original en modo offline sin bloquear la app.
- La PWA guarda recursos básicos y agrega una pantalla offline para mejorar el uso sin conexión.
