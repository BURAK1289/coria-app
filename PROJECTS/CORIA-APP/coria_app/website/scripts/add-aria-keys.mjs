#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const locales = ['tr', 'en', 'de', 'fr'];
const messagesDir = path.join(__dirname, '../src/messages');

const ariaKeys = {
  tr: {
    daCoriaUygulamasınıIndirin: "'da CORIA uygulamasını indirin",
    coriaIstatistikleriVeEtkiGöstergeleri: "CORIA istatistikleri ve etki göstergeleri",
    coriaEtkiGöstergesi: "CORIA etki göstergesi"
  },
  en: {
    daCoriaUygulamasınıIndirin: " download CORIA app",
    coriaIstatistikleriVeEtkiGöstergeleri: "CORIA statistics and impact indicators",
    coriaEtkiGöstergesi: "CORIA impact indicator"
  },
  de: {
    daCoriaUygulamasınıIndirin: " CORIA-App herunterladen",
    coriaIstatistikleriVeEtkiGöstergeleri: "CORIA-Statistiken und Impact-Indikatoren",
    coriaEtkiGöstergesi: "CORIA-Impact-Indikator"
  },
  fr: {
    daCoriaUygulamasınıIndirin: " télécharger l'application CORIA",
    coriaIstatistikleriVeEtkiGöstergeleri: "Statistiques CORIA et indicateurs d'impact",
    coriaEtkiGöstergesi: "Indicateur d'impact CORIA"
  }
};

for (const locale of locales) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Ensure common.aria namespace exists
  if (!content.common) {
    content.common = {};
  }
  if (!content.common.aria) {
    content.common.aria = {};
  }

  // Add aria keys
  Object.assign(content.common.aria, ariaKeys[locale]);

  // Write back with sorted keys
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');

  console.log(`✅ Added aria keys to ${locale}.json`);
}

console.log('\n✅ All locale files updated with aria keys');
