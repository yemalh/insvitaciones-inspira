import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const db = createServerSupabase()

  const { data, error } = await db
    .from('attendees')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Invitado no encontrado.' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const db = createServerSupabase()

  const allowed = ['confirmado', 'asistio', 'cancelado']
  if (!allowed.includes(body.status)) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = { status: body.status }
  if (body.status === 'asistio') {
    updateData.checked_in_at = new Date().toISOString()
  }

  const { data, error } = await db
    .from('attendees')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Error al actualizar.' }, { status: 500 })
  }

  return NextResponse.json(data)
}
