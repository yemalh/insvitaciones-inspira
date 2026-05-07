-- Invitaciones Inspira — Schema para Supabase
-- Pega este SQL en: Supabase Dashboard → SQL Editor → New Query → Run

CREATE TABLE IF NOT EXISTS attendees (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text        NOT NULL,
  phone         text        NOT NULL,
  email         text,
  folio         text        UNIQUE,
  event_name    text,
  event_date    text,
  event_time    text,
  location      text,
  qr_value      text,
  pass_url      text,
  status        text        NOT NULL DEFAULT 'confirmado'
                            CHECK (status IN ('confirmado', 'asistio', 'cancelado')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  checked_in_at timestamptz
);

-- Index para búsqueda rápida por folio
CREATE INDEX IF NOT EXISTS attendees_folio_idx ON attendees(folio);

-- Index para ordenar por fecha de creación
CREATE INDEX IF NOT EXISTS attendees_created_at_idx ON attendees(created_at DESC);

-- Desactivar Row Level Security para uso con service role key
-- (La app usa SUPABASE_SERVICE_ROLE_KEY en el servidor, que bypassa RLS)
ALTER TABLE attendees DISABLE ROW LEVEL SECURITY;

-- Si prefieres usar RLS con la anon key en el futuro, actívala y usa estas políticas:
-- ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Service role has full access" ON attendees USING (true);
