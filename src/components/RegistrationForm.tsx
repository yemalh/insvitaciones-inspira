'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { eventConfig } from '@/lib/event-config'

interface FormState {
  full_name: string
  phone: string
  email: string
  time_slot: string
}

interface FieldError {
  full_name?: string
  phone?: string
  email?: string
  time_slot?: string
}

function validate(form: FormState): FieldError {
  const errors: FieldError = {}
  if (!form.full_name.trim() || form.full_name.trim().length < 2) {
    errors.full_name = 'Por favor escribe tu nombre completo.'
  }
  if (!form.phone.trim() || form.phone.trim().length < 8) {
    errors.phone = 'Ingresa tu número de WhatsApp (mínimo 8 dígitos).'
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'El correo electrónico no parece válido.'
  }
  if (!form.time_slot) {
    errors.time_slot = 'Elige el horario de tu preferencia.'
  }
  return errors
}

function InputField({
  id, label, type, value, name, placeholder, autoComplete, error, onChange,
}: {
  id: string; label: React.ReactNode; type: string; value: string; name: string
  placeholder: string; autoComplete?: string; error?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: '#2d6b52' }}>
        {label}
      </label>
      <input
        id={id} name={name} type={type} autoComplete={autoComplete}
        value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all"
        style={{ backgroundColor: error ? '#fff5f5' : '#faf8f5', borderColor: error ? '#c9823a' : '#dfd0b3', color: '#2d2d2d' }}
        onFocus={(e) => (e.target.style.borderColor = '#2d6b52')}
        onBlur={(e) => (e.target.style.borderColor = error ? '#c9823a' : '#dfd0b3')}
      />
      {error && <p className="mt-1.5 text-xs" style={{ color: '#c9823a' }}>{error}</p>}
    </div>
  )
}

export default function RegistrationForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ full_name: '', phone: '', email: '', time_slot: '' })
  const [errors, setErrors] = useState<FieldError>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name as keyof FieldError]) setErrors((err) => ({ ...err, [name]: undefined }))
    setServerError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fieldErrors = validate(form)
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }

    setLoading(true)
    setServerError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          time_slot: form.time_slot,
        }),
      })

      const data = await res.json()
      if (!res.ok) { setServerError(data.error || 'Error al registrar. Intenta de nuevo.'); return }
      router.push(`/pase/${data.id}`)
    } catch {
      setServerError('Error de conexión. Revisa tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <InputField
        id="full_name" name="full_name" type="text" autoComplete="name"
        label="Nombre completo *" value={form.full_name}
        placeholder="Tu nombre como quieres aparecer"
        error={errors.full_name} onChange={handleChange}
      />

      <InputField
        id="phone" name="phone" type="tel" autoComplete="tel"
        label="WhatsApp *" value={form.phone}
        placeholder="+52 000 000 0000"
        error={errors.phone} onChange={handleChange}
      />

      <InputField
        id="email" name="email" type="email" autoComplete="email"
        label={
          <>
            Correo electrónico{' '}
            <span style={{ color: '#b08b5e', fontWeight: 'normal', letterSpacing: 'normal', textTransform: 'none', fontSize: '11px' }}>
              (opcional)
            </span>
          </>
        }
        value={form.email}
        placeholder="tu@correo.com"
        error={errors.email} onChange={handleChange}
      />

      {/* Time slot selection */}
      <div>
        <p className="block text-xs font-medium tracking-widest uppercase mb-3" style={{ color: '#2d6b52' }}>
          Horario *
        </p>
        <div className="grid grid-cols-2 gap-3">
          {eventConfig.timeSlots.map((slot) => {
            const selected = form.time_slot === slot
            return (
              <label
                key={slot}
                className="flex flex-col items-center justify-center py-4 rounded-xl cursor-pointer transition-all border"
                style={{
                  backgroundColor: selected ? '#1f4433' : '#faf8f5',
                  borderColor: selected ? '#2d6b52' : errors.time_slot ? '#c9823a' : '#dfd0b3',
                  boxShadow: selected ? '0 4px 12px rgba(29,67,51,0.2)' : 'none',
                }}
              >
                <input
                  type="radio" name="time_slot" value={slot}
                  checked={selected}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span
                  className="text-lg font-light"
                  style={{ color: selected ? '#f5f0e8' : '#2d2d2d', fontFamily: 'Georgia, serif' }}
                >
                  {slot}
                </span>
                <span
                  className="text-xs mt-0.5"
                  style={{ color: selected ? '#8dc4a8' : '#94714a' }}
                >
                  {eventConfig.eventDate}
                </span>
              </label>
            )
          })}
        </div>
        {errors.time_slot && (
          <p className="mt-1.5 text-xs" style={{ color: '#c9823a' }}>{errors.time_slot}</p>
        )}
      </div>

      {serverError && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#fff5f5', border: '1px solid #c9823a', color: '#7a3a1a' }}>
          {serverError}
        </div>
      )}

      <button
        type="submit" disabled={loading}
        className="w-full py-4 rounded-xl text-sm font-medium tracking-widest uppercase transition-all duration-200"
        style={{ backgroundColor: loading ? '#94714a' : '#2d6b52', color: '#f5f0e8', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.15em' }}
      >
        {loading ? 'Confirmando tu lugar...' : 'Confirmar mi asistencia'}
      </button>

      <p className="text-center text-xs" style={{ color: '#b08b5e' }}>
        Al confirmar aceptas recibir información sobre el evento.
      </p>
    </form>
  )
}
