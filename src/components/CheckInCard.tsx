'use client'

import { useState } from 'react'
import type { Attendee, AttendeeStatus } from '@/types'

const statusLabels: Record<AttendeeStatus, string> = {
  confirmado: 'Confirmado',
  asistio: 'Asistió',
  cancelado: 'Cancelado',
}

const statusColors: Record<AttendeeStatus, { bg: string; text: string; border: string }> = {
  confirmado: { bg: '#f0f9f4', text: '#2d6b52', border: '#8dc4a8' },
  asistio: { bg: '#f0f9f4', text: '#1f4433', border: '#2d6b52' },
  cancelado: { bg: '#fff5f5', text: '#7a3a1a', border: '#c9823a' },
}

export default function CheckInCard({ attendee }: { attendee: Attendee }) {
  const [status, setStatus] = useState<AttendeeStatus>(attendee.status as AttendeeStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkedInAt, setCheckedInAt] = useState(attendee.checked_in_at)

  async function handleCheckIn() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/checkin/${attendee.id}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al registrar asistencia.')
        return
      }
      setStatus('asistio')
      setCheckedInAt(data.checked_in_at)
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  const colors = statusColors[status]

  return (
    <div
      className="w-full max-w-sm rounded-2xl overflow-hidden shadow-md"
      style={{ backgroundColor: '#faf8f5', border: '1px solid #dfd0b3' }}
    >
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #1f4433, #2d6b52, #c4a882)' }} />

      <div className="p-7">
        {/* Status badge */}
        <div className="flex justify-center mb-5">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            {statusLabels[status]}
          </span>
        </div>

        {/* Guest info */}
        <div className="text-center mb-6">
          <h2
            className="text-xl font-light mb-2"
            style={{ color: '#1f4433', fontFamily: 'Georgia, serif' }}
          >
            {attendee.full_name}
          </h2>
          <p
            className="text-sm font-semibold tracking-widest"
            style={{ color: '#c4a882', letterSpacing: '3px' }}
          >
            {attendee.folio}
          </p>
          <p className="text-xs mt-1" style={{ color: '#94714a' }}>
            {attendee.phone}
          </p>
        </div>

        {/* Event details */}
        <div
          className="rounded-xl p-4 mb-5 space-y-2"
          style={{ backgroundColor: '#f0ece4', border: '1px solid #dfd0b3' }}
        >
          <div className="flex justify-between text-xs">
            <span style={{ color: '#94714a' }}>Experiencia</span>
            <span style={{ color: '#2d2d2d', fontWeight: '500' }}>{attendee.event_name}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: '#94714a' }}>Fecha</span>
            <span style={{ color: '#2d2d2d' }}>{attendee.event_date}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: '#94714a' }}>Hora</span>
            <span style={{ color: '#2d2d2d' }}>{attendee.event_time}</span>
          </div>
        </div>

        {/* Check-in time */}
        {checkedInAt && (
          <p className="text-center text-xs mb-4" style={{ color: '#2d6b52' }}>
            Ingresó:{' '}
            {new Date(checkedInAt).toLocaleString('es-MX', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </p>
        )}

        {/* Error */}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-xs text-center"
            style={{ backgroundColor: '#fff5f5', color: '#7a3a1a', border: '1px solid #c9823a' }}
          >
            {error}
          </div>
        )}

        {/* Check-in button */}
        {status === 'confirmado' && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all"
            style={{
              backgroundColor: loading ? '#94714a' : '#2d6b52',
              color: '#f5f0e8',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Registrando...' : 'Marcar asistencia'}
          </button>
        )}

        {status === 'asistio' && (
          <div
            className="w-full py-3.5 rounded-xl text-sm text-center font-medium"
            style={{ backgroundColor: '#f0f9f4', color: '#1f4433', border: '1px solid #8dc4a8' }}
          >
            ✓ Asistencia registrada
          </div>
        )}

        {status === 'cancelado' && (
          <div
            className="w-full py-3.5 rounded-xl text-sm text-center font-medium"
            style={{ backgroundColor: '#fff5f5', color: '#7a3a1a', border: '1px solid #c9823a' }}
          >
            Invitación cancelada
          </div>
        )}
      </div>
    </div>
  )
}
