import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Inspira — Experiencia de Meditación',
  description: 'Respiración · Meditación · Contemplación. Confirma tu lugar.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ backgroundColor: '#f5f0e8' }}>
        {children}
      </body>
    </html>
  )
}
