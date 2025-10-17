#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messagesDir = path.join(__dirname, '../src/messages');

// Hero section translations for all locales
const heroTranslations = {
  tr: {
    cta: {
      iosIçinİndir: "iOS için İndir",
      androidIçinİndir: "Android için İndir"
    },
    stats: {
      milyarÜrünVerisi: "Milyar Ürün Verisi",
      etiketVeİçerik: "Etiket ve İçerik",
      aktifKullanıcı: "Aktif Kullanıcı"
    }
  },
  en: {
    cta: {
      iosIçinİndir: "Download for iOS",
      androidIçinİndir: "Download for Android"
    },
    stats: {
      milyarÜrünVerisi: "Billion Product Data",
      etiketVeİçerik: "Labels and Content",
      aktifKullanıcı: "Active Users"
    }
  },
  de: {
    cta: {
      iosIçinİndir: "Für iOS herunterladen",
      androidIçinİndir: "Für Android herunterladen"
    },
    stats: {
      milyarÜrünVerisi: "Milliarden Produktdaten",
      etiketVeİçerik: "Labels und Inhalt",
      aktifKullanıcı: "Aktive Nutzer"
    }
  },
  fr: {
    cta: {
      iosIçinİndir: "Télécharger pour iOS",
      androidIçinİndir: "Télécharger pour Android"
    },
    stats: {
      milyarÜrünVerisi: "Milliards de données produit",
      etiketVeİçerik: "Étiquettes et contenu",
      aktifKullanıcı: "Utilisateurs actifs"
    }
  }
};

// Aria translations for common namespace
const ariaTranslations = {
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

const locales = ['tr', 'en', 'de', 'fr'];

for (const locale of locales) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Ensure hero namespace exists
  if (!content.hero) {
    content.hero = {};
  }

  // Add cta and stats to hero namespace (will overwrite if exists)
  content.hero.cta = heroTranslations[locale].cta;
  content.hero.stats = heroTranslations[locale].stats;

  // Ensure common.aria namespace exists
  if (!content.common) {
    content.common = {};
  }
  if (!content.common.aria) {
    content.common.aria = {};
  }

  // Add aria translations (will merge with existing)
  Object.assign(content.common.aria, ariaTranslations[locale]);

  // Write back with sorted keys and proper formatting
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');

  console.log(`✅ Fixed hero translations in ${locale}.json`);
}

console.log('\n✅ All locale files updated successfully');
console.log('\nAdded to all locales:');
console.log('  - hero.cta.iosIçinİndir');
console.log('  - hero.cta.androidIçinİndir');
console.log('  - hero.stats.milyarÜrünVerisi');
console.log('  - hero.stats.etiketVeİçerik');
console.log('  - hero.stats.aktifKullanıcı');
console.log('  - common.aria.daCoriaUygulamasınıIndirin');
console.log('  - common.aria.coriaIstatistikleriVeEtkiGöstergeleri');
console.log('  - common.aria.coriaEtkiGöstergesi');
