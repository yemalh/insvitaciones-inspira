import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase'
import { eventConfig } from '@/lib/event-config'
import { Resend } from 'resend'

const schema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(8, 'Ingresa un WhatsApp válido'),
  email: z.string().email('El correo no es válido').optional().or(z.literal('')),
  time_slot: z.string().min(1, 'Elige un horario'),
})

function buildEmailHtml(params: {
  name: string
  folio: string
  passUrl: string
}) {
  const { name, folio, passUrl } = params
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1f4433 0%,#2d6b52 100%);border-radius:16px;overflow:hidden;">
        <tr>
          <td style="padding:40px 40px 20px;text-align:center;">
            <p style="color:#c4a882;font-size:11px;letter-spacing:4px;margin:0 0 8px;text-transform:uppercase;">CONFIRMACIÓN DE ASISTENCIA</p>
            <h1 style="color:#f5f0e8;font-size:36px;font-weight:300;margin:0;letter-spacing:8px;">INSPIRA</h1>
            <p style="color:#c4a882;font-size:12px;letter-spacing:2px;margin:8px 0 0;">Respiración · Meditación · Contemplación</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;text-align:center;">
            <p style="color:#8dc4a8;font-size:14px;margin:0 0 16px;">Tu lugar está confirmado</p>
            <h2 style="color:#f5f0e8;font-size:24px;font-weight:400;margin:0 0 8px;">${name}</h2>
            <p style="color:#c4a882;font-size:13px;letter-spacing:3px;margin:0;font-weight:bold;">${folio}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(196,168,130,0.2);border-bottom:1px solid rgba(196,168,130,0.2);padding:20px 0;">
              <tr>
                <td style="width:50%;padding:8px 0;">
                  <p style="color:#8dc4a8;font-size:10px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">Experiencia</p>
                  <p style="color:#f5f0e8;font-size:13px;margin:0;">${eventConfig.eventName}</p>
                </td>
                <td style="width:50%;padding:8px 0;">
                  <p style="color:#8dc4a8;font-size:10px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">Lugar</p>
                  <p style="color:#f5f0e8;font-size:13px;margin:0;">${eventConfig.location}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;">
                  <p style="color:#8dc4a8;font-size:10px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">Fecha</p>
                  <p style="color:#f5f0e8;font-size:13px;margin:0;">${eventConfig.eventDate}</p>
                </td>
                <td style="padding:8px 0;">
                  <p style="color:#8dc4a8;font-size:10px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">Hora</p>
                  <p style="color:#f5f0e8;font-size:13px;margin:0;">${eventConfig.eventTime}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 40px;text-align:center;">
            <a href="${passUrl}" style="display:inline-block;background-color:#c9823a;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;letter-spacing:1px;">Ver mi pase digital</a>
            <p style="color:#8dc4a8;font-size:12px;margin:24px 0 0;letter-spacing:1px;font-style:italic;">Respira. Conecta. Transforma.</p>
          </td>
        </tr>
      </table>
      <p style="text-align:center;color:#94714a;font-size:11px;margin:20px 0 0;">Si no solicitaste este correo, ignóralo.</p>
    </td></tr>
  </table>
</body>
</html>
`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { full_name, phone, email, time_slot } = parsed.data
    const db = createServerSupabase()

    // Check capacity
    const { count } = await db
      .from('attendees')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'cancelado')

    if (count !== null && count >= eventConfig.maxCapacity) {
      return NextResponse.json(
        { error: 'Lo sentimos, el cupo está lleno.' },
        { status: 409 }
      )
    }

    // Generate next folio number
    const { data: lastAttendee } = await db
      .from('attendees')
      .select('folio')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let nextNumber = 1
    if (lastAttendee?.folio) {
      const match = lastAttendee.folio.match(/INSPIRA-(\d+)/)
      if (match) nextNumber = parseInt(match[1]) + 1
    }

    const folio = `INSPIRA-${String(nextNumber).padStart(3, '0')}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Insert attendee (without pass_url first to get the id)
    const { data: newAttendee, error: insertError } = await db
      .from('attendees')
      .insert({
        full_name,
        phone,
        email: email || null,
        folio,
        event_name: eventConfig.eventName,
        event_date: eventConfig.eventDate,
        event_time: time_slot,
        location: eventConfig.location,
        status: 'confirmado',
      })
      .select()
      .single()

    if (insertError || !newAttendee) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Error al guardar el registro. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    const passUrl = `${appUrl}/pase/${newAttendee.id}`
    const qrValue = `${appUrl}/checkin/${newAttendee.id}`

    // Update with pass_url and qr_value
    await db
      .from('attendees')
      .update({ pass_url: passUrl, qr_value: qrValue })
      .eq('id', newAttendee.id)

    // Send confirmation email
    if (email && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'Inspira <hola@inspira.mx>',
          to: email,
          subject: 'Tu invitación a Inspira está confirmada',
          html: buildEmailHtml({ name: full_name, folio, passUrl }),
        })
      } catch (emailErr) {
        console.error('Email error (non-fatal):', emailErr)
      }
    }

    return NextResponse.json({ id: newAttendee.id, folio })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json(
      { error: 'Error inesperado. Por favor intenta de nuevo.' },
      { status: 500 }
    )
  }
}
