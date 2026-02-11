# Guía de Despliegue: Versión Demo (modulR)

Para compartir la versión demo con clientes, la mejor estrategia es desplegar la rama `demo` como un proyecto independiente en Vercel.

## 1. Crear Proyecto Demo en Vercel
1. Ve a tu [Dashboard de Vercel](https://vercel.com/dashboard).
2. Haz clic en **"Add New..."** -> **"Project"**.
3. Importa el repositorio `aplicacionBodega`.
4. **IMPORTANTE**: En la configuración del proyecto:
    - **Project Name**: Cámbialo a algo como `modulr-demo` (para que la URL sea `modulr-demo.vercel.app`).
    - **Framework Preset**: Vite (se detecta automático).
    - **Root Directory**: `./` (default).
    - **Build & Development Settings**:
        - Haz clic en **Edit** al lado de "Output Directory" si es necesario (usualmente `dist` es correcto).
5. **CRÍTICO**: Desplázate hacia abajo hasta **"Deploy"**. Pero antes, asegúrate de que estás desplegando la rama `demo`.
    - Si Vercel te obliga a desplegar `main` primero, hazlo. Luego ve a **Settings -> Git -> Production Branch** y cámbiala a `demo`.
    - O mejor aún: Cuando importas, si te deja elegir la rama, elige `demo`.

## 2. Variables de Entorno
¡No necesitas configurar nada!
La versión `demo` está diseñada para funcionar con datos falsos (mock data) y no requiere conexión a Supabase.

## 3. Compartir con el Cliente
Una vez desplegado, comparte la URL (ej: `https://modulr-demo.vercel.app`).

### Credenciales de Acceso
Envía estos PINs al cliente para que pruebe diferentes roles:

| Rol | PIN | Nombre Demo |
| :--- | :--- | :--- |
| **Administrador** | `1234` | Admin Demo |
| **Bodeguero** | `2222` | Carlos Bodega |
| **Operario** | `1111` | Juan Operario |

## 4. Actualizar la Demo
Si haces cambios en la rama `demo` y haces `git push`, Vercel actualizará automáticamente la versión demo.
