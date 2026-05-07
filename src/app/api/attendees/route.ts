import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin_auth')

  if (!auth || auth.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const db = createServerSupabase()
  const { data, error } = await db
    .from('attendees')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Error al obtener asistentes.' }, { status: 500 })
  }

  return NextResponse.json(data)
}
