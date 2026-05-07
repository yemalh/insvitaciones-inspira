import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const db = createServerSupabase()

  const { data, error } = await db
    .from('attendees')
    .update({ status: 'asistio', checked_in_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Error al registrar asistencia.' }, { status: 500 })
  }

  return NextResponse.json(data)
}
