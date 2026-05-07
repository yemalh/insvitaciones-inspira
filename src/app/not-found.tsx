import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: '#f5f0e8' }}
    >
      <h1
        className="text-4xl font-light mb-4"
        style={{ color: '#1f4433', letterSpacing: '10px', fontFamily: 'Georgia, serif' }}
      >
        INSPIRA
      </h1>
      <p className="text-sm mb-2" style={{ color: '#94714a' }}>
        Esta página no existe o el pase no se encontró.
      </p>
      <p className="text-xs mb-8" style={{ color: '#c4a882' }}>
        Verifica el enlace o regresa al inicio.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl text-sm font-medium tracking-wide"
        style={{ backgroundColor: '#2d6b52', color: '#f5f0e8' }}
      >
        Volver al inicio
      </Link>
    </main>
  )
}
