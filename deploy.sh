#!/bin/bash

# Script de Despliegue Automático a Vercel
# Uso: ./deploy.sh "Mensaje del commit (opcional)"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Iniciando proceso de despliegue a Vercel...${NC}"

# 1. Agregar todos los cambios
echo -e "${GREEN}📦 Agregando archivos al control de versiones...${NC}"
git add .

# 2. Preparar mensaje de commit
MSG="$1"
if [ -z "$MSG" ]; then
  FECHA=$(date +'%d/%m/%Y %H:%M')
  MSG="Actualización automática: mejoras y correcciones ($FECHA)"
fi

# 3. Realizar Commit
echo -e "${GREEN}💾 Guardando cambios: \"$MSG\"...${NC}"
git commit -m "$MSG"

# 4. Enviar a GitHub (Vercel detectará esto automáticamente)
echo -e "${GREEN}☁️  Subiendo a GitHub y disparando Vercel...${NC}"
git push origin main

echo -e "${YELLOW}✅ Despliegue iniciado! Vercel está construyendo la nueva versión.${NC}"
echo -e "Puedes ver el estado en tu dashboard de Vercel."
