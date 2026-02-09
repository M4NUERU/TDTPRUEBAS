---
description: Deploy rapido a Vercel con commit automatico
---

# Deploy a Vercel

Workflow para hacer deploy de la aplicacion a produccion.

## Pasos

1. Verificar que no hay errores de build
// turbo
```bash
npm run build
```

2. Agregar cambios a git
// turbo
```bash
git add .
```

3. Hacer commit con mensaje descriptivo
```bash
git commit -m "Deploy: [descripcion breve del cambio]"
```

4. Push a repositorio remoto
// turbo
```bash
git push origin main
```

5. Deploy a produccion en Vercel
// turbo
```bash
vercel --prod --yes
```

6. Verificar el deploy
- Abrir la URL de produccion: https://todotejidos-manager.vercel.app
- Confirmar que los cambios estan reflejados

## Notas
- Si el build falla, revisar errores en la consola antes de continuar
- Para deploy de preview (sin produccion): `vercel --yes`
- Para ver logs del deploy: `vercel logs`
