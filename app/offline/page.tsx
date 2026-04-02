export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-6 py-10">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Sin conexión</h1>
        <p className="mt-3 text-sm text-slate-600">
          Estás sin internet. Puedes volver al inicio y usar OCR local con las imágenes que ya cargues.
        </p>
        <a
          href="/"
          className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  );
}
