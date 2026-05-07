import Image from 'next/image'
import RegistrationForm from '@/components/RegistrationForm'
import { eventConfig } from '@/lib/event-config'

export const metadata = {
  title: 'Confirma tu lugar — Inspira',
  description: 'Respiración · Meditación · Contemplación. Reserva tu lugar en la experiencia Inspira.',
}

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start py-12 px-4"
      style={{ backgroundColor: '#f5f0e8' }}
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div
          className="rounded-2xl overflow-hidden mb-4"
          style={{ backgroundColor: '#111', padding: '20px 28px' }}
        >
          <Image
            src="/logo.png"
            alt="Inspira"
            width={180}
            height={180}
            priority
            className="block"
          />
        </div>
        <p className="text-sm text-center" style={{ color: '#c4a882', letterSpacing: '1.5px' }}>
          {eventConfig.brand.tagline}
        </p>
      </div>

      {/* Event info */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 text-xs" style={{ color: '#2d6b52' }}>
        <span className="flex items-center gap-1.5">
          <span style={{ color: '#c4a882' }}>◆</span>
          {eventConfig.eventDate}
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ color: '#c4a882' }}>◆</span>
          {eventConfig.location}
        </span>
      </div>

      {/* Card container */}
      <div
        className="w-full max-w-sm rounded-2xl shadow-lg overflow-hidden"
        style={{ backgroundColor: '#faf8f5', border: '1px solid #dfd0b3' }}
      >
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #1f4433, #2d6b52, #c4a882)' }} />
        <div className="p-7">
          <h2 className="text-base font-medium mb-1" style={{ color: '#1f4433', letterSpacing: '0.05em' }}>
            Confirma tu asistencia
          </h2>
          <p className="text-xs mb-6" style={{ color: '#94714a', lineHeight: '1.6' }}>
            {eventConfig.welcomeText}
          </p>
          <RegistrationForm />
        </div>
      </div>

      <p className="mt-6 text-xs text-center" style={{ color: '#b08b5e' }}>
        Cupo limitado a {eventConfig.maxCapacity} personas
      </p>
    </main>
  )
}
