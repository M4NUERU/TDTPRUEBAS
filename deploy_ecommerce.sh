#!/bin/bash
cd /home/josu/Documentos/paginaTodoTejidos
git add .
git commit -m "feat: redesign Navy/Gold branding, fix cart functionality, add WhatsApp button and SEO"
git push
echo "✅ Deploy triggered! Vercel will update in ~2 minutes"
