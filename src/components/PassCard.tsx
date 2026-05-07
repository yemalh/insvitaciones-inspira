'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { Attendee } from '@/types'

interface Props {
  attendee: Attendee
}

function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" fill="#8dc4a8" />
    </svg>
  )
}

export default function PassCard({ attendee }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function generateQR() {
      try {
        const QRCode = (await import('qrcode')).default
        const url = await QRCode.toDataURL(attendee.qr_value || window.location.href, {
          width: 180,
          margin: 2,
          color: { dark: '#1f4433', light: '#f5f0e8' },
          errorCorrectionLevel: 'M',
        })
        setQrDataUrl(url)
      } catch (e) {
        console.error('QR generation failed:', e)
      }
    }
    generateQR()
  }, [attendee.qr_value])

  const handleDownloadPng = useCallback(async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: undefined,
      })
      const link = document.createElement('a')
      link.download = `inspira-pase-${attendee.folio}.png`
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.error('PNG download failed:', e)
      alert('Error al descargar. Intenta de nuevo.')
    } finally {
      setDownloading(false)
    }
  }, [attendee.folio])

  const handleDownloadPdf = useCallback(async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const { jsPDF } = await import('jspdf')

      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 })
      const img = new Image()
      img.src = dataUrl
      await new Promise((r) => (img.onload = r))

      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width / 3, img.height / 3],
      })
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / 3, img.height / 3)
      pdf.save(`inspira-pase-${attendee.folio}.pdf`)
    } catch (e) {
      console.error('PDF download failed:', e)
      alert('Error al generar el PDF. Intenta de nuevo.')
    } finally {
      setDownloading(false)
    }
  }, [attendee.folio])

  const whatsappMessage = `Hola, ${attendee.full_name}.\n\nTu lugar para la experiencia Inspira quedó confirmado.\n\nNúmero de invitado: ${attendee.folio}\n\nExperiencia: Respiración · Meditación · Contemplación\nFecha: ${attendee.event_date}\nHora: ${attendee.event_time}\nLugar: ${attendee.location}\n\nPresenta este número o tu pase digital al llegar.\n\nRespira. Conecta. Transforma.\n${attendee.pass_url}`

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappMessage)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('No se pudo copiar. Copia el mensaje manualmente.')
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8 w-full max-w-sm mx-auto">
      {/* THE PASS CARD */}
      <div
        ref={cardRef}
        style={{
          background: 'linear-gradient(160deg, #1f4433 0%, #2d6b52 45%, #1a3829 100%)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '360px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 32px 64px rgba(29,67,51,0.45)',
          border: '1px solid rgba(196,168,130,0.15)',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'rgba(196,168,130,0.05)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', left: '-30px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(141,196,168,0.06)', pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ padding: '24px 28px 18px', textAlign: 'center', position: 'relative' }}>
          <p style={{
            color: '#8dc4a8', fontSize: '10px', letterSpacing: '4px',
            margin: '0 0 14px', textTransform: 'uppercase', fontWeight: '500',
          }}>
            CONFIRMACIÓN DE ASISTENCIA
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Inspira"
            width={120}
            height={120}
            style={{ display: 'block', margin: '0 auto 10px', borderRadius: '12px' }}
          />
          <p style={{ color: '#c4a882', fontSize: '11px', letterSpacing: '1.5px', margin: 0 }}>
            Respiración · Meditación · Contemplación
          </p>
        </div>

        {/* Divider */}
        <div style={{ padding: '0 28px' }}>
          <div style={{ height: '1px', background: 'rgba(196,168,130,0.2)' }} />
        </div>

        {/* Guest info */}
        <div style={{ padding: '22px 28px 18px', textAlign: 'center' }}>
          <p style={{ color: '#8dc4a8', fontSize: '11px', letterSpacing: '2px', margin: '0 0 10px', textTransform: 'uppercase' }}>
            Tu lugar está confirmado
          </p>
          <h2 style={{
            color: '#f5f0e8', fontSize: '22px', fontWeight: '400',
            margin: '0 0 10px', fontFamily: 'Georgia, serif', lineHeight: '1.3',
          }}>
            {attendee.full_name}
          </h2>
          <div style={{
            display: 'inline-block', padding: '5px 14px',
            background: 'rgba(196,168,130,0.12)',
            borderRadius: '20px', border: '1px solid rgba(196,168,130,0.25)',
          }}>
            <p style={{ color: '#c4a882', fontSize: '13px', letterSpacing: '3px', margin: 0, fontWeight: '600' }}>
              {attendee.folio}
            </p>
          </div>
        </div>

        {/* Event details */}
        <div style={{ padding: '0 28px' }}>
          <div style={{ height: '1px', background: 'rgba(196,168,130,0.15)' }} />
        </div>
        <div style={{ padding: '18px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <p style={{ color: '#8dc4a8', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px' }}>Experiencia</p>
            <p style={{ color: '#f5f0e8', fontSize: '12px', margin: 0 }}>{attendee.event_name}</p>
          </div>
          <div>
            <p style={{ color: '#8dc4a8', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px' }}>Lugar</p>
            <p style={{ color: '#f5f0e8', fontSize: '12px', margin: 0 }}>{attendee.location}</p>
          </div>
          <div>
            <p style={{ color: '#8dc4a8', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px' }}>Fecha</p>
            <p style={{ color: '#f5f0e8', fontSize: '12px', margin: 0 }}>{attendee.event_date}</p>
          </div>
          <div>
            <p style={{ color: '#8dc4a8', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px' }}>Hora</p>
            <p style={{ color: '#f5f0e8', fontSize: '12px', margin: 0 }}>{attendee.event_time}</p>
          </div>
        </div>

        {/* Tear line */}
        <div style={{ padding: '0 0', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f5f0e8', flexShrink: 0, marginLeft: '-10px' }} />
          <div style={{ flex: 1, borderTop: '2px dashed rgba(196,168,130,0.25)', margin: '0 6px' }} />
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f5f0e8', flexShrink: 0, marginRight: '-10px' }} />
        </div>

        {/* QR section */}
        <div style={{ padding: '20px 28px 28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {qrDataUrl ? (
            <div style={{
              background: '#f5f0e8', borderRadius: '10px', padding: '8px',
              width: '96px', height: '96px', flexShrink: 0,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR de pase" width={80} height={80} style={{ display: 'block' }} />
            </div>
          ) : (
            <div style={{
              background: 'rgba(196,168,130,0.1)', borderRadius: '10px',
              width: '96px', height: '96px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <p style={{ color: '#8dc4a8', fontSize: '10px', textAlign: 'center', margin: 0 }}>Generando QR...</p>
            </div>
          )}
          <div>
            <p style={{ color: '#c4a882', fontSize: '12px', margin: '0 0 6px', lineHeight: '1.5' }}>
              Presenta este pase al llegar
            </p>
            <p style={{ color: '#8dc4a8', fontSize: '10px', margin: 0, fontStyle: 'italic', letterSpacing: '1px' }}>
              Inhala. Conecta. Transforma.
            </p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="w-full max-w-sm space-y-3">
        {/* Download PNG */}
        <button
          onClick={handleDownloadPng}
          disabled={downloading}
          className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-all"
          style={{ backgroundColor: '#2d6b52', color: '#f5f0e8', opacity: downloading ? 0.7 : 1 }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 16l-4-4h3V4h2v8h3l-4 4zm-7 4v-2h14v2H5z" fill="currentColor"/></svg>
          Descargar como imagen
        </button>

        {/* Download PDF */}
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-all"
          style={{ backgroundColor: '#1f4433', color: '#f5f0e8', opacity: downloading ? 0.7 : 1 }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-3 8v-2H8v-2h2v-1.5a2.5 2.5 0 015 0V13h.5v2H15v2h-5z" fill="currentColor"/></svg>
          Descargar como PDF
        </button>

        {/* WhatsApp share */}
        <button
          onClick={handleWhatsApp}
          className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-all"
          style={{ backgroundColor: '#25d366', color: '#fff' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.522 5.858L.057 23.5a.5.5 0 00.609.609l5.642-1.465A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.937 0-3.757-.528-5.313-1.447l-.38-.226-3.948 1.025 1.044-3.813-.249-.393A9.712 9.712 0 012.25 12C2.25 6.59 6.59 2.25 12 2.25S21.75 6.59 21.75 12 17.41 21.75 12 21.75z"/></svg>
          Compartir por WhatsApp
        </button>

        {/* Copy message */}
        <button
          onClick={handleCopy}
          className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-all border"
          style={{
            backgroundColor: copied ? '#f0f9f4' : '#faf8f5',
            borderColor: copied ? '#2d6b52' : '#dfd0b3',
            color: copied ? '#2d6b52' : '#2d2d2d',
          }}
        >
          {copied ? (
            <>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/></svg>
              Mensaje copiado
            </>
          ) : (
            <>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg>
              Copiar mensaje
            </>
          )}
        </button>
      </div>

      {/* Info note */}
      <p className="text-center text-xs max-w-xs" style={{ color: '#94714a' }}>
        <LeafIcon />
        Guarda este pase o descárgalo para presentarlo al entrar.
      </p>
    </div>
  )
}
