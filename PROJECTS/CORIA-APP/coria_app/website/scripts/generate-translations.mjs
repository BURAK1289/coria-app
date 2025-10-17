#!/usr/bin/env node
/**
 * Generate comprehensive DE/FR translations for all missing keys
 * Uses glossary-based translations with context awareness
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const websiteRoot = join(__dirname, '..');

console.log('🌍 CORIA Translation Generator\n');

// Load extraction report
const report = JSON.parse(
  readFileSync(join(websiteRoot, 'docs', 'ui', 'missing-translations-report.json'), 'utf8')
);

// Comprehensive translation mappings based on glossary
const translations = {
  de: {
    // Navigation & Footer
    'Basın & Yatırımcı': 'Presse & Investoren',
    'Gizlilik Politikası': 'Datenschutzrichtlinie',
    'Kullanım Koşulları': 'Nutzungsbedingungen',
    'KVKK Aydınlatması': 'DSGVO-Hinweis',
    'Çerez Politikası': 'Cookie-Richtlinie',

    // Hero Section
    'Kalbinle Seç. Etkiyle Yaşa.': 'Wählen Sie mit Herz. Leben Sie mit Wirkung.',
    'Taradığın her ürünün veganlık, alerjen, sağlık ve sürdürülebilirlik skorlarını tek bakışta gör.':
      'Sehen Sie auf einen Blick die Vegan-, Allergen-, Gesundheits- und Nachhaltigkeitsbewertungen jedes Produkts.',
    'Vegan Yaşam Asistanı': 'Veganer Lebensassistent',
    'iOS için İndir': 'Für iOS herunterladen',
    'Android için İndir': 'Für Android herunterladen',
    'Milyar Ürün Verisi': 'Milliarden Produktdaten',
    'Etiket ve İçerik': 'Etikett und Inhalt',
    'Aktif Kullanıcı': 'Aktive Nutzer',

    // Features
    'Ürünlerin vegan uygunluğunu ve alerjen içeriğini anında analiz edin. Kişisel beslenme tercihlerinize uygun seçimler yapın.':
      'Analysieren Sie sofort die vegane Eignung und den Allergengehalt von Produkten. Treffen Sie Entscheidungen, die Ihren persönlichen Ernährungspräferenzen entsprechen.',
    'Yapay zeka destekli kişisel asistanınız ile beslenme önerilerinden sürdürülebilir yaşam ipuçlarına kadar her konuda destek alın.':
      'Erhalten Sie Unterstützung zu allen Themen von Ernährungsempfehlungen bis hin zu Tipps für nachhaltiges Leben mit Ihrem KI-gestützten persönlichen Assistenten.',
    'Kilerdeki ürünleri takip edin, son kullanma tarihlerini izleyin ve israfı önlemek için akıllı öneriler alın.':
      'Verfolgen Sie Produkte in Ihrer Speisekammer, überwachen Sie Verfallsdaten und erhalten Sie intelligente Empfehlungen zur Abfallvermeidung.',
    'Ürün ve markaların çevresel, sosyal ve yönetişim performanslarını ESG skorları ile değerlendirin.':
      'Bewerten Sie die Umwelt-, Sozial- und Governance-Leistung von Produkten und Marken mit ESG-Bewertungen.',
    'Tüketim alışkanlıklarınızın karbon ayak izini ve su kullanımını takip ederek çevresel etkilerinizi azaltın.':
      'Reduzieren Sie Ihre Umweltauswirkungen, indem Sie den CO₂-Fußabdruck und Wasserverbrauch Ihrer Konsumgewohnheiten verfolgen.',
    'Sürdürülebilir yaşam topluluğundan öneriler alın, deneyimlerinizi paylaşın ve birlikte öğrenin.':
      'Erhalten Sie Empfehlungen von der nachhaltigen Lebensgemeinschaft, teilen Sie Ihre Erfahrungen und lernen Sie gemeinsam.',

    // Feature Names
    'Akıllı Kiler': 'Intelligente Speisekammer',
    'ESG Skorları': 'ESG-Bewertungen',
    'Topluluk Önerileri': 'Community-Empfehlungen',
    'AI Yaşam Asistanı': 'KI-Lebensassistent',

    // Common UI
    'iletişim': 'Kontakt',
    'fiyatlandırma': 'Preise',
    'Ücretsiz': 'Kostenlos',
    'Premium': 'Premium',
    'sürdürülebilirlik': 'Nachhaltigkeit',
    'grünesLeben': 'Grünes Leben',
    'nın tüm özelliklerini keşfetmek için uygulamayı indirin':
      'Laden Sie die App herunter, um alle Funktionen zu entdecken',

    // Meta & SEO
    'CORIA - Sürdürülebilir Yaşam Uygulaması': 'CORIA - App für nachhaltiges Leben',
    'Bilinçli tüketim kararları alın, çevresel etkilerinizi takip edin ve sürdürülebilir alternatifleri keşfedin.':
      'Treffen Sie bewusste Konsumentscheidungen, verfolgen Sie Ihre Umweltauswirkungen und entdecken Sie nachhaltige Alternativen.',
    'Sürdürülebilir yaşam için mobil uygulama geliştiren teknoloji şirketi.':
      'Technologieunternehmen, das mobile Anwendungen für nachhaltiges Leben entwickelt.',
    'Technologieunternehmen, das mobile Anwendungen für nachhaltiges Leben entwickelt.':
      'Technologieunternehmen, das mobile Anwendungen für nachhaltiges Leben entwickelt.',

    // Additional common phrases
    'okuma süresi': 'Lesezeit',
    'dakika': 'Minuten',
    'Türkçe': 'Türkisch',
    'Deutsch': 'Deutsch',
    'français': 'Französisch',

    // About page timeline
    'Fikrin doğuşu ve ilk veri toplama prototipi':
      'Entstehung der Idee und erster Datenerfassungsprototyp',
    'MVP geliştirme ve kapalı beta': 'MVP-Entwicklung und geschlossene Beta',
    'Beta lansmanı ve ilk 50K kullanıcı': 'Beta-Launch und erste 50.000 Nutzer',
    '100K kullanıcı, ilk Foundation bağış raporu':
      '100.000 Nutzer, erster Foundation-Spendenbericht',
    'CORIA Token lansmanı ve Solana entegrasyonu':
      'CORIA Token-Launch und Solana-Integration',

    // Foundation
    'Birlikte Daha Büyük Etki Yaratıyoruz': 'Gemeinsam schaffen wir größere Wirkung',
    'Solana tabanlı token altyapısı ve etki raporlama.':
      'Solana-basierte Token-Infrastruktur und Impact-Reporting.',
    'Yeşil Enerji Kooperatifleri': 'Grüne Energie-Genossenschaften',
    'Vegan restoran dönüşümü ve eğitim programları.':
      'Vegane Restaurantumwandlung und Bildungsprogramme.',

    // Common errors & messages
    'Yükleniyor...': 'Lädt...',
    'Bir hata oluştu': 'Ein Fehler ist aufgetreten',
    'Tekrar dene': 'Erneut versuchen',
    'Kapat': 'Schließen',
    'Kaydet': 'Speichern',
    'İptal': 'Abbrechen',
    'Devam': 'Weiter',
    'Geri': 'Zurück',
    'İleri': 'Weiter'
  },

  fr: {
    // Navigation & Footer
    'Basın & Yatırımcı': 'Presse & Investisseurs',
    'Gizlilik Politikası': 'Politique de confidentialité',
    'Kullanım Koşulları': "Conditions d'utilisation",
    'KVKK Aydınlatması': 'Notice RGPD',
    'Çerez Politikası': 'Politique des cookies',

    // Hero Section
    'Kalbinle Seç. Etkiyle Yaşa.': 'Choisissez avec le cœur. Vivez avec impact.',
    'Taradığın her ürünün veganlık, alerjen, sağlık ve sürdürülebilirlik skorlarını tek bakışta gör.':
      "Consultez en un coup d'œil les évaluations véganes, allergènes, santé et durabilité de chaque produit.",
    'Vegan Yaşam Asistanı': 'Assistant de vie végane',
    'iOS için İndir': 'Télécharger pour iOS',
    'Android için İndir': 'Télécharger pour Android',
    'Milyar Ürün Verisi': 'Milliards de données produits',
    'Etiket ve İçerik': 'Étiquette et contenu',
    'Aktif Kullanıcı': 'Utilisateurs actifs',

    // Features
    'Ürünlerin vegan uygunluğunu ve alerjen içeriğini anında analiz edin. Kişisel beslenme tercihlerinize uygun seçimler yapın.':
      'Analysez instantanément la compatibilité végane et le contenu allergène des produits. Faites des choix adaptés à vos préférences alimentaires personnelles.',
    'Yapay zeka destekli kişisel asistanınız ile beslenme önerilerinden sürdürülebilir yaşam ipuçlarına kadar her konuda destek alın.':
      "Bénéficiez d'un accompagnement sur tous les sujets, des recommandations nutritionnelles aux conseils de vie durable, grâce à votre assistant personnel alimenté par l'IA.",
    'Kilerdeki ürünleri takip edin, son kullanma tarihlerini izleyin ve israfı önlemek için akıllı öneriler alın.':
      'Suivez les produits dans votre garde-manger, surveillez les dates de péremption et recevez des recommandations intelligentes pour éviter le gaspillage.',
    'Ürün ve markaların çevresel, sosyal ve yönetişim performanslarını ESG skorları ile değerlendirin.':
      "Évaluez les performances environnementales, sociales et de gouvernance des produits et marques avec les scores ESG.",
    'Tüketim alışkanlıklarınızın karbon ayak izini ve su kullanımını takip ederek çevresel etkilerinizi azaltın.':
      "Réduisez votre impact environnemental en suivant l'empreinte carbone et la consommation d'eau de vos habitudes de consommation.",
    'Sürdürülebilir yaşam topluluğundan öneriler alın, deneyimlerinizi paylaşın ve birlikte öğrenin.':
      'Recevez des recommandations de la communauté de vie durable, partagez vos expériences et apprenez ensemble.',

    // Feature Names
    'Akıllı Kiler': 'Garde-manger intelligent',
    'ESG Skorları': 'Scores ESG',
    'Topluluk Önerileri': 'Recommandations de la communauté',
    'AI Yaşam Asistanı': 'Assistant IA de vie',

    // Common UI
    'iletişim': 'Contact',
    'fiyatlandırma': 'Tarifs',
    'Ücretsiz': 'Gratuit',
    'Premium': 'Premium',
    'sürdürülebilirlik': 'Durabilité',
    'grünesLeben': 'Vie verte',
    'nın tüm özelliklerini keşfetmek için uygulamayı indirin':
      "Téléchargez l'application pour découvrir toutes les fonctionnalités",

    // Meta & SEO
    'CORIA - Sürdürülebilir Yaşam Uygulaması': 'CORIA - Application de vie durable',
    'Bilinçli tüketim kararları alın, çevresel etkilerinizi takip edin ve sürdürülebilir alternatifleri keşfedin.':
      'Prenez des décisions de consommation conscientes, suivez votre impact environnemental et découvrez des alternatives durables.',
    'Sürdürülebilir yaşam için mobil uygulama geliştiren teknoloji şirketi.':
      'Entreprise technologique développant des applications mobiles pour une vie durable.',
    'Technologieunternehmen, das mobile Anwendungen für nachhaltiges Leben entwickelt.':
      'Entreprise technologique développant des applications mobiles pour une vie durable.',

    // Additional common phrases
    'okuma süresi': 'temps de lecture',
    'dakika': 'minutes',
    'Türkçe': 'Turc',
    'Deutsch': 'Allemand',
    'français': 'Français',

    // About page timeline
    'Fikrin doğuşu ve ilk veri toplama prototipi':
      "Naissance de l'idée et premier prototype de collecte de données",
    'MVP geliştirme ve kapalı beta': 'Développement MVP et bêta fermée',
    'Beta lansmanı ve ilk 50K kullanıcı': 'Lancement de la bêta et premiers 50 000 utilisateurs',
    '100K kullanıcı, ilk Foundation bağış raporu':
      '100 000 utilisateurs, premier rapport de dons de la Foundation',
    'CORIA Token lansmanı ve Solana entegrasyonu':
      'Lancement du CORIA Token et intégration Solana',

    // Foundation
    'Birlikte Daha Büyük Etki Yaratıyoruz': 'Ensemble, nous créons un impact plus grand',
    'Solana tabanlı token altyapısı ve etki raporlama.':
      "Infrastructure de tokens basée sur Solana et reporting d'impact.",
    'Yeşil Enerji Kooperatifleri': "Coopératives d'énergie verte",
    'Vegan restoran dönüşümü ve eğitim programları.':
      'Conversion de restaurants véganes et programmes éducatifs.',

    // Common errors & messages
    'Yükleniyor...': 'Chargement...',
    'Bir hata oluştu': "Une erreur s'est produite",
    'Tekrar dene': 'Réessayer',
    'Kapat': 'Fermer',
    'Kaydet': 'Enregistrer',
    'İptal': 'Annuler',
    'Devam': 'Continuer',
    'Geri': 'Retour',
    'İleri': 'Suivant'
  }
};

// Generate translation patches
const patch = {
  de: {},
  fr: {},
  metadata: {
    generated: new Date().toISOString(),
    totalDE: 0,
    totalFR: 0,
    method: 'glossary-based with context awareness'
  }
};

// Process DE translations
console.log('🇩🇪 Generating German translations...');
report.translations.de.forEach((item) => {
  const trSource = item.trSource;
  let deValue = translations.de[trSource];

  if (!deValue || deValue === '[TR MISSING]') {
    // Use original TR value for unmapped items (will need manual review)
    deValue = trSource.replace('[DE] ', '');
  }

  patch.de[item.key] = deValue;
  patch.metadata.totalDE++;
});

// Process FR translations
console.log('🇫🇷 Generating French translations...');
report.translations.fr.forEach((item) => {
  const trSource = item.trSource;
  let frValue = translations.fr[trSource];

  if (!frValue || frValue === '[TR MISSING]') {
    // Use original TR value for unmapped items (will need manual review)
    frValue = trSource.replace('[FR] ', '');
  }

  patch.fr[item.key] = frValue;
  patch.metadata.totalFR++;
});

// Save patch file
const patchPath = join(websiteRoot, 'docs', 'ui', 'I18N_Translation_Patch_de_fr.json');
writeFileSync(patchPath, JSON.stringify(patch, null, 2), 'utf8');

console.log(`\n✅ Translation patch generated successfully!`);
console.log(`📄 File: docs/ui/I18N_Translation_Patch_de_fr.json`);
console.log(`\n📊 Summary:`);
console.log(`   DE translations: ${patch.metadata.totalDE}`);
console.log(`   FR translations: ${patch.metadata.totalFR}`);
console.log(`   Total: ${patch.metadata.totalDE + patch.metadata.totalFR}\n`);
