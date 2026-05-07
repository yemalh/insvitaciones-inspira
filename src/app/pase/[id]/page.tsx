export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import PassCard from '@/components/PassCard'
import type { Attendee } from '@/types'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const db = createServerSupabase()
  const { data } = await db.from('attendees').select('full_name, folio').eq('id', id).single()
  if (!data) return { title: 'Pase no encontrado — Inspira' }
  return { title: `Pase de ${data.full_name} — Inspira` }
}

export default async function PassPage({ params }: Props) {
  const { id } = await params
  const db = createServerSupabase()

  const { data: attendee, error } = await db
    .from('attendees')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !attendee) {
    notFound()
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center pt-10 pb-16 px-4"
      style={{ backgroundColor: '#f5f0e8' }}
    >
      {/* Brand header */}
      <div className="text-center mb-8">
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#2d6b52', letterSpacing: '4px' }}>
          Tu pase para
        </p>
        <h1
          className="text-4xl font-light"
          style={{ color: '#1f4433', letterSpacing: '10px', fontFamily: 'Georgia, serif' }}
        >
          INSPIRA
        </h1>
      </div>

      <PassCard attendee={attendee as Attendee} />

      {/* Back link */}
      <a
        href="/"
        className="mt-4 text-xs underline-offset-4 hover:underline"
        style={{ color: '#94714a' }}
      >
        ← Registrar a otra persona
      </a>
    </main>
  )
}
