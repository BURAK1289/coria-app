#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messagesDir = path.join(__dirname, '../src/messages');

// Complete hero section translations for all locales
const heroTranslations = {
  tr: {
    badge: {
      veganYaşamAsistanı: "Vegan Yaşam Asistanı"
    },
    title: {
      kalbinleSeçEtkiyleYaşa: "Kalbinle Seç. Etkiyle Yaşa.",
      taradığınHerÜrününVeganlıkAlerjenSağlıkVeSü: "Taradığın her ürünün veganlık, alerjen, sağlık ve sürdürülebilirlik skorlarını anında gör."
    },
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
    badge: {
      veganYaşamAsistanı: "Vegan Lifestyle Assistant"
    },
    title: {
      kalbinleSeçEtkiyleYaşa: "Choose with Heart. Live with Impact.",
      taradığınHerÜrününVeganlıkAlerjenSağlıkVeSü: "Instantly see vegan, allergen, health and sustainability scores for every product you scan."
    },
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
    badge: {
      veganYaşamAsistanı: "Veganer Lebensstil-Assistent"
    },
    title: {
      kalbinleSeçEtkiyleYaşa: "Mit dem Herzen wählen. Mit Wirkung leben.",
      taradığınHerÜrününVeganlıkAlerjenSağlıkVeSü: "Sehen Sie sofort die veganen, Allergen-, Gesundheits- und Nachhaltigkeitswerte für jedes gescannte Produkt."
    },
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
    badge: {
      veganYaşamAsistanı: "Assistant de mode de vie végétalien"
    },
    title: {
      kalbinleSeçEtkiyleYaşa: "Choisissez avec le cœur. Vivez avec impact.",
      taradığınHerÜrününVeganlıkAlerjenSağlıkVeSü: "Consultez instantanément les scores végétaliens, allergènes, santé et durabilité de chaque produit scanné."
    },
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

  // Replace entire hero namespace with complete structure
  content.hero = heroTranslations[locale];

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

  console.log(`✅ Fixed complete hero translations in ${locale}.json`);
}

console.log('\n✅ All locale files updated with complete hero structure');
console.log('\nAdded to all locales:');
console.log('  - hero.badge.veganYaşamAsistanı');
console.log('  - hero.title.kalbinleSeçEtkiyleYaşa');
console.log('  - hero.title.taradığınHerÜrününVeganlıkAlerjenSağlıkVeSü');
console.log('  - hero.cta.iosIçinİndir');
console.log('  - hero.cta.androidIçinİndir');
console.log('  - hero.stats.milyarÜrünVerisi');
console.log('  - hero.stats.etiketVeİçerik');
console.log('  - hero.stats.aktifKullanıcı');
console.log('  - common.aria.daCoriaUygulamasınıIndirin');
console.log('  - common.aria.coriaIstatistikleriVeEtkiGöstergeleri');
console.log('  - common.aria.coriaEtkiGöstergesi');
