export type AttendeeStatus = 'confirmado' | 'asistio' | 'cancelado'

export interface Attendee {
  id: string
  full_name: string
  phone: string
  email: string | null
  folio: string
  event_name: string
  event_date: string
  event_time: string
  location: string
  qr_value: string
  pass_url: string
  status: AttendeeStatus
  created_at: string
  checked_in_at: string | null
}

export interface RegisterFormData {
  full_name: string
  phone: string
  email?: string
}
