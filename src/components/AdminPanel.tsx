'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Attendee, AttendeeStatus } from '@/types'
import { eventConfig } from '@/lib/event-config'

const statusLabels: Record<AttendeeStatus, string> = {
  confirmado: 'Confirmado',
  asistio: 'Asistió',
  cancelado: 'Cancelado',
}

const statusColors: Record<AttendeeStatus, { bg: string; text: string }> = {
  confirmado: { bg: '#f0f9f4', text: '#2d6b52' },
  asistio: { bg: '#e8f5e9', text: '#1f4433' },
  cancelado: { bg: '#fff5f5', text: '#7a3a1a' },
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{ backgroundColor: '#faf8f5', border: '1px solid #dfd0b3' }}
    >
      <p className="text-3xl font-light mb-1" style={{ color: '#1f4433', fontFamily: 'Georgia, serif' }}>
        {value}
      </p>
      <p className="text-xs tracking-wide uppercase" style={{ color: '#94714a' }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: '#c4a882' }}>{sub}</p>}
    </div>
  )
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchAttendees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/attendees')
      if (res.status === 401) {
        setIsLoggedIn(false)
        return
      }
      const data = await res.json()
      setAttendees(Array.isArray(data) ? data : [])
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) fetchAttendees()
  }, [isLoggedIn, fetchAttendees])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setIsLoggedIn(true)
      } else {
        setLoginError('Contraseña incorrecta.')
      }
    } catch {
      setLoginError('Error de conexión.')
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setIsLoggedIn(false)
    setAttendees([])
  }

  async function handleStatusChange(id: string, status: AttendeeStatus) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/attendee/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const updated = await res.json()
        setAttendees((prev) => prev.map((a) => (a.id === id ? updated : a)))
      }
    } finally {
      setUpdating(null)
    }
  }

  // --- Login screen ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f5f0e8' }}>
        <div
          className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg"
          style={{ backgroundColor: '#faf8f5', border: '1px solid #dfd0b3' }}
        >
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #1f4433, #2d6b52, #c4a882)' }} />
          <div className="p-8">
            <div className="text-center mb-6">
              <div style={{ backgroundColor: '#111', borderRadius: '12px', padding: '12px 16px', display: 'inline-block', marginBottom: '12px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Inspira" width={100} height={100} style={{ display: 'block' }} />
              </div>
              <p className="text-xs tracking-widest uppercase" style={{ color: '#c4a882' }}>Panel de Administrador</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#2d6b52' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError('') }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                  style={{
                    backgroundColor: '#f5f0e8',
                    borderColor: loginError ? '#c9823a' : '#dfd0b3',
                    color: '#2d2d2d',
                  }}
                />
                {loginError && (
                  <p className="mt-1.5 text-xs" style={{ color: '#c9823a' }}>{loginError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-xl text-sm font-medium tracking-widest uppercase"
                style={{ backgroundColor: '#2d6b52', color: '#f5f0e8', opacity: loginLoading ? 0.7 : 1 }}
              >
                {loginLoading ? 'Verificando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // --- Stats ---
  const total = attendees.filter((a) => a.status !== 'cancelado').length
  const attended = attendees.filter((a) => a.status === 'asistio').length
  const cancelled = attendees.filter((a) => a.status === 'cancelado').length
  const available = Math.max(0, eventConfig.maxCapacity - total)

  // --- Filtered list ---
  const filtered = attendees.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return a.full_name.toLowerCase().includes(q) || a.folio?.toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: '#f5f0e8' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: '#111', borderRadius: '8px', padding: '6px 8px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Inspira" width={48} height={48} style={{ display: 'block' }} />
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase" style={{ color: '#c4a882' }}>Panel de Administrador</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={fetchAttendees}
              className="px-4 py-2 rounded-lg text-xs"
              style={{ backgroundColor: '#faf8f5', color: '#2d6b52', border: '1px solid #dfd0b3' }}
            >
              Actualizar
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-xs"
              style={{ backgroundColor: '#fff5f5', color: '#7a3a1a', border: '1px solid #c9823a' }}
            >
              Salir
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Confirmados" value={total} />
          <StatCard label="Asistieron" value={attended} />
          <StatCard label="Disponibles" value={available} sub={`de ${eventConfig.maxCapacity}`} />
          <StatCard label="Cancelados" value={cancelled} />
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o folio..."
            className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
            style={{ backgroundColor: '#faf8f5', borderColor: '#dfd0b3', color: '#2d2d2d' }}
          />
        </div>

        {/* Table / List */}
        {loading ? (
          <div className="text-center py-16" style={{ color: '#94714a' }}>Cargando asistentes...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: '#94714a' }}>
            {search ? 'Sin resultados para esa búsqueda.' : 'Aún no hay asistentes registrados.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => {
              const colors = statusColors[a.status as AttendeeStatus] || statusColors.confirmado
              const isUpdating = updating === a.id
              return (
                <div
                  key={a.id}
                  className="rounded-xl p-4 sm:p-5"
                  style={{ backgroundColor: '#faf8f5', border: '1px solid #dfd0b3' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-xs font-semibold tracking-widest"
                          style={{ color: '#c4a882' }}
                        >
                          {a.folio}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {statusLabels[a.status as AttendeeStatus] || a.status}
                        </span>
                        {a.event_time && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: '#f0ece4', color: '#2d6b52', border: '1px solid #dfd0b3' }}
                          >
                            {a.event_time}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate" style={{ color: '#1f4433' }}>
                        {a.full_name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#94714a' }}>
                        {a.phone}
                        {a.email && ` · ${a.email}`}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#b08b5e' }}>
                        Registrado:{' '}
                        {new Date(a.created_at).toLocaleString('es-MX', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                        {a.checked_in_at && (
                          <>
                            {' · '}Ingresó:{' '}
                            {new Date(a.checked_in_at).toLocaleString('es-MX', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {a.status !== 'asistio' && (
                        <button
                          onClick={() => handleStatusChange(a.id, 'asistio')}
                          disabled={isUpdating}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ backgroundColor: '#2d6b52', color: '#f5f0e8', opacity: isUpdating ? 0.6 : 1 }}
                        >
                          ✓ Asistió
                        </button>
                      )}
                      {a.status !== 'confirmado' && (
                        <button
                          onClick={() => handleStatusChange(a.id, 'confirmado')}
                          disabled={isUpdating}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ backgroundColor: '#f0f9f4', color: '#2d6b52', border: '1px solid #8dc4a8', opacity: isUpdating ? 0.6 : 1 }}
                        >
                          Restaurar
                        </button>
                      )}
                      {a.status !== 'cancelado' && (
                        <button
                          onClick={() => handleStatusChange(a.id, 'cancelado')}
                          disabled={isUpdating}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ backgroundColor: '#fff5f5', color: '#7a3a1a', border: '1px solid #c9823a', opacity: isUpdating ? 0.6 : 1 }}
                        >
                          Cancelar
                        </button>
                      )}
                      <a
                        href={`/pase/${a.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: '#faf8f5', color: '#94714a', border: '1px solid #dfd0b3' }}
                      >
                        Pase
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
