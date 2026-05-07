# Invitaciones Inspira

Sistema de confirmación de asistencia y pases digitales para la experiencia Inspira.

---

## ¿Qué hace esta app?

- La persona entra al link, escribe su nombre y WhatsApp (correo opcional)
- El sistema genera un **número de invitado único** (INSPIRA-001, INSPIRA-002...)
- Se muestra un **pase digital visual premium** con QR
- La persona puede **descargar el pase** como imagen o PDF
- La persona puede **compartir por WhatsApp**
- Si dio correo, recibe un **correo automático** con su pase
- El equipo puede hacer **check-in** escaneando el QR
- Panel de **administrador** para ver todos los registros

---

## Instrucciones de instalación (paso a paso)

### Paso 1 — Supabase (base de datos gratuita)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto (dale un nombre, ej: "inspira")
3. Espera que el proyecto se cree (~2 minutos)
4. Ve a **SQL Editor** en el menú lateral
5. Haz clic en **New Query**
6. Copia todo el contenido del archivo `supabase-schema.sql` y pégalo ahí
7. Haz clic en **Run** (ícono de play)
8. Debes ver "Success. No rows returned."
9. Ve a **Settings → API** y copia estos valores:
   - `Project URL` → será tu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → será tu `SUPABASE_SERVICE_ROLE_KEY`

### Paso 2 — Resend (correos automáticos, opcional)

> Si no quieres enviar correos, salta este paso. La app funciona igual.

1. Ve a [resend.com](https://resend.com) y crea una cuenta gratuita
2. Ve a **API Keys** y crea una nueva key
3. Guarda el valor → será tu `RESEND_API_KEY`
4. Para el correo `FROM_EMAIL`: si no tienes dominio propio, usa `onboarding@resend.dev` para pruebas
   - Para producción, agrega y verifica tu dominio en Resend

### Paso 3 — Variables de entorno en local

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env.local
   ```
2. Abre `.env.local` y llena los valores que obtuviste en los pasos anteriores
3. Para `ADMIN_PASSWORD`, pon una contraseña que recuerdes (mínimo 12 caracteres)
4. Para `NEXT_PUBLIC_APP_URL`, en desarrollo usa `http://localhost:3000`

### Paso 4 — Correr en modo desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Paso 5 — Desplegar en Vercel (gratis)

1. Crea una cuenta en [vercel.com](https://vercel.com)
2. Sube el proyecto a GitHub:
   ```bash
   git add .
   git commit -m "primer commit"
   ```
   Luego crea un repositorio en GitHub y haz push.
3. En Vercel, haz clic en **Add New Project** y selecciona tu repositorio
4. En la sección **Environment Variables**, agrega todas las variables de tu `.env.local`
   - Cambia `NEXT_PUBLIC_APP_URL` por la URL de Vercel que te asigne (puedes actualizarla después del primer deploy)
5. Haz clic en **Deploy**
6. Vercel te dará una URL como `https://invitaciones-inspira.vercel.app`
7. Actualiza `NEXT_PUBLIC_APP_URL` con esa URL en Vercel y haz redeploy

---

## Configurar los datos del evento

Abre el archivo `src/lib/event-config.ts` y edita los valores:

```typescript
export const eventConfig = {
  eventName: 'Experiencia Inspira',    // Nombre del evento
  eventDate: '15 de junio, 2025',      // Fecha
  eventTime: '6:00 PM',                // Hora
  location: 'Álamos Roof, Querétaro',  // Lugar
  maxCapacity: 30,                     // Cupo máximo
  contactWhatsApp: '+52 442 000 0000', // WhatsApp de contacto
  welcomeText: 'Tu presencia hace posible este espacio.',
}
```

---

## Rutas de la app

| Ruta | Descripción |
|------|-------------|
| `/` | Formulario de registro público |
| `/pase/[id]` | Pase digital del invitado |
| `/checkin/[id]` | Pantalla de check-in (se abre al escanear el QR) |
| `/admin` | Panel de administrador (requiere contraseña) |

---

## Panel de administrador

1. Ve a `tudominio.com/admin`
2. Ingresa la contraseña que configuraste en `ADMIN_PASSWORD`
3. Verás stats de confirmados, asistentes y cupo disponible
4. Puedes buscar por nombre o folio
5. Puedes marcar asistencia o cancelar invitaciones

---

## Check-in el día del evento

Escanea el QR del pase del invitado con la cámara del teléfono. Se abrirá la pantalla `/checkin/[id]` donde puedes marcar su asistencia con un botón.

---

## Preguntas frecuentes

**¿Qué pasa si se llena el cupo?**
El sistema no permite nuevos registros y muestra un mensaje de cupo lleno.

**¿Cuánto cuesta?**
- Supabase: gratuito (hasta 500MB y 50,000 filas)
- Vercel: gratuito
- Resend: gratuito (hasta 3,000 correos/mes)
- **Total: $0**

---

## Stack tecnológico

- **Next.js 15** con App Router y TypeScript
- **Tailwind CSS** para estilos
- **Supabase** para base de datos
- **Resend** para correos automáticos
- **qrcode** para generar códigos QR
- **html-to-image** para descarga como imagen PNG
- **jsPDF** para descarga como PDF
- **zod** para validación de formularios
