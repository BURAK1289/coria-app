# Port 3000 Kullanım Sorunu ve Çözümü

## Problem
Command+C ile dev sunucuyu durdurduğunuzda, bazen port 3000 işgal edilmiş olarak kalır.
Bu yüzden tekrar başlattığınızda Next.js otomatik olarak 3001'e geçer.

## Neden Oluyor?
- Node.js process tam terminate olmamış olabilir
- Zombie process kalmış olabilir
- macOS'ta process cleanup gecikmeli olur

## Çözümler

### Yöntem 1: Otomatik Temizlik (ÖNERİLEN) ✅
```bash
npm run dev:clean
```
Bu komut:
1. Port 3000'i otomatik temizler
2. Dev sunucuyu başlatır
3. Her seferinde port 3000'den başlar

### Yöntem 2: Manuel Port Temizleme
```bash
# Port 3000'i işgal eden process'i bul ve öldür
lsof -ti:3000 | xargs kill -9

# Sonra normal başlat
npm run dev
```

### Yöntem 3: Tüm Node Process'lerini Temizle
```bash
# DİKKAT: Bu BÜTÜN Node.js uygulamalarını kapatır!
killall -9 node

# Sonra başlat
npm run dev
```

## Port Durumunu Kontrol Etme
```bash
# Port 3000'de çalışan process'leri görüntüle
lsof -i:3000

# Tüm açık portları görüntüle
lsof -iTCP -sTCP:LISTEN -n -P
```

## İpuçları
- Terminal'de `Ctrl+C` yerine `Command+C` kullanıyorsanız, process tam kapanmayabilir
- VS Code'da integrated terminal kullanıyorsanız, terminal'i kapatın ve yenisini açın
- Eğer sık sık bu problemle karşılaşıyorsanız, `npm run dev:clean` kullanın
