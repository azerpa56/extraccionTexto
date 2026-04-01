'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, RefreshCcw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setIsCameraOn(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo acceder a la cámara';
      setError(message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOn(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.95)
    );

    if (!blob) {
      setError('No se pudo capturar la foto');
      return;
    }

    const file = new File([blob], `captura-${Date.now()}.jpg`, { type: 'image/jpeg' });
    onCapture(file);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Cámara</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {isCameraOn ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      {error ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="relative mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        {isCameraOn ? (
          <video ref={videoRef} autoPlay playsInline className="h-72 w-full object-cover" />
        ) : (
          <div className="flex h-72 w-full items-center justify-center text-slate-500">
            Vista previa de cámara
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {!isCameraOn ? (
          <button
            onClick={startCamera}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Camera size={16} />
            Encender cámara
          </button>
        ) : (
          <>
            <button
              onClick={capturePhoto}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Camera size={16} />
              Tomar foto
            </button>

            <button
              onClick={stopCamera}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <CameraOff size={16} />
              Apagar
            </button>

            <button
              onClick={startCamera}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              Reiniciar
            </button>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
