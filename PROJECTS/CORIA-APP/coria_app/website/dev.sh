#!/bin/bash

# Port 3000'i temizle
echo "🧹 Port 3000 temizleniyor..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Kısa bir bekleme
sleep 1

# Dev sunucuyu başlat
echo "🚀 Dev sunucu başlatılıyor..."
npm run dev
