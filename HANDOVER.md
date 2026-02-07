# Manual de Entrega y Configuración - Bodega TodoTejidos

Este documento contiene la información necesaria para entregar el proyecto, configurar las integraciones pendientes (MercadoLibre) y migrar la propiedad de las cuentas.

## 1. Integración MercadoLibre (Pendiente de Activación)

El sistema ya tiene instalado el "motor" para recibir ventas de MercadoLibre automáticamente. Solo hace falta la "llave" para encenderlo.

### Pasos para el Administrador/Dueño:
1.  Ingresar a [developers.mercadolibre.com.co](https://developers.mercadolibre.com.co/) con la cuenta dueña.
2.  Crear una nueva Aplicación con estos datos:
    *   **Redirect URI:** `https://tuchatbot-o-postman.com` (Usa `https://oauth.pstmn.io/v1/callback` si usarás Postman para obtener el primer token).
    *   **Callback URL:** La URL de tu proyecto en Vercel + `/api/mercadolibre-webhook`.
3.  Obtener **App ID** y **Client Secret**.

### Configuración en Vercel:
Ir a `Vercel -> Settings -> Environment Variables` y agregar:
*   `MERCADOLIBRE_APP_ID`: (Pegar App ID)
*   `MERCADOLIBRE_CLIENT_SECRET`: (Pegar Client Secret)

## 2. Base de Datos (Supabase)

Se debe ejecutar el siguiente script en el **SQL Editor** de Supabase para habilitar el guardado de llaves:

```sql
create table if not exists public.integraciones (
  id text primary key,
  access_token text,
  refresh_token text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table public.integraciones enable row level security;
create policy "Enable full access for service role" on public.integraciones using (true) with check (true);
```

## 3. Migración de Cuentas (Entrega del Proyecto)

Cuando se decida entregar el software a la empresa, seguir estos pasos para no perder nada:

### A. Código (GitHub)
1.  La empresa debe crear su cuenta de GitHub (ej. `github.com/todotejidos-tech`).
2.  En tu repositorio actual, ve a **Settings -> General -> Danger Zone -> Transfer**.
3.  Escribe el nombre de usuario de la empresa.
4.  Ellos recibirán un email para aceptar la transferencia. Todo el historial se mantiene.

### B. Servidor (Vercel)
1.  La empresa debe crear una cuenta en Vercel.
2.  Opción Fácil: Simplemente "Importar" el proyecto desde el GitHub (que ya transfiriste en el paso A). Vercel detectará el código y lanzará la página.
3.  Opción Avanzada (Transferir): Vercel permite transferir proyectos solo entre equipos "Pro". Es más fácil redeployar en la cuenta nueva.

### C. Base de Datos (Supabase)
1.  En el proyecto de Supabase, ve a **Settings -> General**.
2.  Busca "Transfer Project" (requiere que la otra cuenta esté en la misma "Organización") O MÁS FÁCIL:
3.  Invita al email de la empresa en **Settings -> Team** como `Admin` o `Owner`.
4.  Una vez acepten, tú puedes salir del equipo, y ellos quedan como dueños absolutos.

---
**Soporte Técnico:**
Para cualquier duda técnica sobre este documento, revisar los archivos en la carpeta `/api` del código fuente.
