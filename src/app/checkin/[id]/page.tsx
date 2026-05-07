export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import CheckInCard from '@/components/CheckInCard'
import type { Attendee } from '@/types'

type Props = { params: Promise<{ id: string }> }

export const metadata = { title: 'Check-in — Inspira' }

export default async function CheckInPage({ params }: Props) {
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
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#f5f0e8' }}
    >
      <div className="text-center mb-6">
        <h1
          className="text-3xl font-light mb-1"
          style={{ color: '#1f4433', letterSpacing: '8px', fontFamily: 'Georgia, serif' }}
        >
          INSPIRA
        </h1>
        <p className="text-xs tracking-widest" style={{ color: '#c4a882', letterSpacing: '3px' }}>
          CHECK-IN
        </p>
      </div>

      <CheckInCard attendee={attendee as Attendee} />
    </main>
  )
}
