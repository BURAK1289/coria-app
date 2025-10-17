#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const messagesDir = path.join(__dirname, '../src/messages');

console.log('🇩🇪 Adding ALL missing German translations...\n');

const deTranslations = {
  navigation: {
    foundation: "Foundation",
    downloadApp: "CORIA App herunterladen",
    sustainableLiving: "Nachhaltiges Leben leicht gemacht"
  },
  features: {
    sidebar: {
      title: "Funktionen erkunden"
    },
    navigation: {
      allFeatures: "Alle Funktionen",
      backToCategory: "Zurück zur Kategorie"
    },
    overview: {
      title: "Alle Funktionen",
      subtitle: "Entdecken Sie die leistungsstarken Tools von CORIA für nachhaltiges Leben",
      learnMore: "Mehr erfahren",
      cta: {
        title: "Bereit zu starten?",
        description: "Laden Sie CORIA herunter und beginnen Sie noch heute Ihre Reise zu nachhaltigem Leben",
        downloadIos: "Für iOS herunterladen",
        downloadAndroid: "Für Android herunterladen"
      }
    },
    categoryOverview: {
      featuresTitle: "Funktionen in dieser Kategorie",
      relatedTitle: "Verwandte Funktionen",
      cta: {
        title: "Diese Funktionen ausprobieren",
        description: "Laden Sie CORIA herunter und entdecken Sie alle Funktionen",
        downloadIos: "Für iOS herunterladen",
        downloadAndroid: "Für Android herunterladen"
      }
    },
    featureDetail: {
      howItWorks: {
        title: "Wie es funktioniert"
      },
      technicalDetails: {
        title: "Technische Details"
      },
      learnMore: "Mehr über diese Funktion erfahren",
      cta: {
        title: "Diese Funktion ausprobieren",
        description: "Laden Sie CORIA herunter und beginnen Sie zu nutzen",
        downloadIos: "Für iOS herunterladen",
        downloadAndroid: "Für Android herunterladen"
      }
    },
    gallery: {
      title: "Sehen Sie es in Aktion",
      watchDemo: "Demo ansehen",
      videoPlaceholder: "Funktion wird geladen..."
    },
    whyItMatters: {
      title: "Warum es wichtig ist",
      statisticsTitle: "Wirkungsstatistiken",
      joinMovement: "Treten Sie der Bewegung bei",
      impactTypes: {
        environmental: "Umwelt",
        health: "Gesundheit",
        economic: "Wirtschaftlich",
        social: "Sozial",
        ethical: "Ethisch",
        global: "Global"
      }
    },
    methodology: {
      title: "Unsere Methodik",
      scoringSystem: "Bewertungssystem",
      scoringRange: "Bewertungsbereich: 0-100",
      updateFrequency: "Aktualisierungsfrequenz",
      scoringFactors: "Bewertungsfaktoren",
      ratings: {
        poor: "Schlecht (0-25)",
        fair: "Ausreichend (26-50)",
        good: "Gut (51-75)",
        excellent: "Ausgezeichnet (76-100)"
      },
      dataProcessing: {
        title: "Datenverarbeitung"
      },
      transparency: {
        title: "Transparenz & Genauigkeit",
        description: "Unser Bewertungssystem basiert auf wissenschaftlichen Daten und wird regelmäßig aktualisiert"
      },
      "environmental-score": {
        description: "Umweltauswirkungen von Produkten basierend auf mehreren Faktoren",
        overview: "Wir bewerten Produkte nach Kohlenstoff-Fußabdruck, Wassernutzung und Abfall",
        updateFrequency: "Täglich aktualisiert",
        dataProcessing: "Automatische Verarbeitung mit manueller Überprüfung",
        factors: [
          { description: "CO2-Emissionen während Produktion und Transport" },
          { description: "Wasserverbrauch und Auswirkungen" },
          { description: "Verpackung und Abfallmanagement" },
          { description: "Biologische Vielfalt und Landnutzung" },
          { description: "Gesamte Lebenszyklusanalyse" }
        ]
      },
      "social-impact": {
        description: "Bewertung der sozialen Verantwortung und ethischen Praktiken",
        overview: "Bewertung der Arbeitsbedingungen, fairen Handels und Gemeinschaftsauswirkungen",
        updateFrequency: "Wöchentlich aktualisiert",
        dataProcessing: "Kombination aus automatisierten und menschlichen Überprüfungen",
        factors: [
          { description: "Faire Arbeitspraktiken und Löhne" },
          { description: "Zertifizierungen für fairen Handel" },
          { description: "Engagement für die Gemeinschaft" },
          { description: "Menschenrechte in der Lieferkette" },
          { description: "Transparenz der sozialen Wirkung" }
        ]
      },
      "health-rating": {
        description: "Ernährungsqualität und Gesundheitsauswirkungen von Produkten",
        overview: "Analyse von Nährstoffen, Zusatzstoffen und gesundheitlichen Vorteilen",
        updateFrequency: "Täglich aktualisiert",
        dataProcessing: "KI-gestützte Ernährungsanalyse",
        factors: [
          { description: "Nährstoffdichte und Qualität" },
          { description: "Verarbeitungsstufe" },
          { description: "Zusatzstoffe und Konservierungsmittel" },
          { description: "Allergene und Ernährungskompatibilität" },
          { description: "Evidenzbasierte gesundheitliche Vorteile" }
        ]
      },
      "ethical-production": {
        description: "Bewertung von Tierwohlfahrt und ethischen Produktionsstandards",
        overview: "Bewertung der Behandlung von Tieren und ethischen Beschaffungspraktiken",
        updateFrequency: "Wöchentlich aktualisiert",
        dataProcessing: "Manuelle Überprüfung mit Expertenvalidierung",
        factors: [
          { description: "Tierwohlfahrtsstandards" },
          { description: "Zertifizierungen und Audits" },
          { description: "Transparenz in der Lieferkette" },
          { description: "Keine Tierversuche" },
          { description: "Vegane und pflanzliche Alternativen" }
        ]
      }
    },
    dataSources: {
      title: "Datenquellen",
      description: "Wir verwenden vertrauenswürdige Datenquellen für genaue Bewertungen",
      verified: "Verifizierte Daten",
      coverage: "Globale Abdeckung",
      updates: "Regelmäßige Aktualisierungen",
      reliability: "Zuverlässigkeitsbewertung",
      visitSource: "Quelle besuchen",
      quality: {
        title: "Datenqualität",
        description: "Alle Datenquellen werden auf Genauigkeit und Zuverlässigkeit überprüft"
      }
    },
    relatedFeatures: {
      title: "Verwandte Funktionen",
      exploreAll: "Alle Funktionen erkunden"
    },
    categories: {
      all: "Alle",
      scanning: "Scannen",
      analysis: "Analyse",
      tracking: "Verfolgung",
      community: "Community",
      sustainability: "Nachhaltigkeit"
    }
  },
  pricing: {
    free: "KOSTENLOS",
    premium: "PREMIUM",
    monthly: "/Monat",
    features: {
      scans: { name: "Scans" },
      unlimitedScans: { name: "Unbegrenzte Scans" },
      basicInsights: { name: "Grundlegende Einblicke" },
      advancedAnalytics: { name: "Erweiterte Analysen" },
      aiRecommendations: { name: "KI-Empfehlungen" },
      prioritySupport: { name: "Priorisierter Support" },
      communityAccess: { name: "Community-Zugang" },
      premiumCommunity: { name: "Premium-Community" },
      dataExport: { name: "Datenexport" },
      customReports: { name: "Benutzerdefinierte Berichte" },
      ads: { name: "Werbung" }
    },
    comparison: {
      title: "Vergleichen Sie Pläne",
      description: "Wählen Sie den Plan, der zu Ihren Bedürfnissen passt",
      features: {
        scans: { name: "Scans", tooltip: "Anzahl der Produkt-Scans pro Monat" },
        unlimitedScans: { name: "Unbegrenzte Scans", tooltip: "Unbegrenzte Produktscans" },
        basicInsights: { name: "Grundlegende Einblicke", tooltip: "Grundlegende Produktinformationen und Bewertungen" },
        advancedAnalytics: { name: "Erweiterte Analysen", tooltip: "Detaillierte Nachhaltigkeits- und Gesundheitsberichte" },
        aiRecommendations: { name: "KI-Empfehlungen", tooltip: "Personalisierte Produktempfehlungen" },
        prioritySupport: { name: "Priorisierter Support", tooltip: "Schnellerer Kundensupport" },
        communityAccess: { name: "Community-Zugang", tooltip: "Zugang zu CORIA-Community-Funktionen" },
        premiumCommunity: { name: "Premium-Community", tooltip: "Exklusiver Zugang zu Premium-Community-Funktionen" },
        dataExport: { name: "Datenexport", tooltip: "Exportieren Sie Ihre Scan-Daten" },
        customReports: { name: "Benutzerdefinierte Berichte", tooltip: "Erstellen Sie benutzerdefinierte Nachhaltigkeitsberichte" },
        ads: { name: "Werbung", tooltip: "Anzeigenfreie Erfahrung" }
      }
    },
    trial: {
      title: "Kostenlose 7-Tage-Testversion",
      description: "Testen Sie alle Premium-Funktionen kostenlos für 7 Tage",
      noCard: "Keine Kreditkarte erforderlich",
      startTrial: "Testversion starten"
    },
    faq: {
      title: "Häufig gestellte Fragen",
      cancel: {
        q: "Kann ich jederzeit kündigen?",
        a: "Ja, Sie können Ihr Abonnement jederzeit kündigen. Es werden keine Fragen gestellt."
      },
      refund: {
        q: "Bieten Sie Rückerstattungen an?",
        a: "Ja, wir bieten eine 30-Tage-Geld-zurück-Garantie für alle Premium-Abonnements."
      },
      dataPrivacy: {
        q: "Wie schützen Sie meine Daten?",
        a: "Wir verwenden Verschlüsselung nach Industriestandard und verkaufen Ihre Daten niemals an Dritte."
      },
      switchPlans: {
        q: "Kann ich zwischen Plänen wechseln?",
        a: "Ja, Sie können jederzeit upgraden oder downgraden. Wir berechnen anteilig."
      }
    }
  },
  legal: {
    privacy: {
      title: "Datenschutzerklärung",
      lastUpdated: "Zuletzt aktualisiert",
      intro: "Diese Datenschutzerklärung beschreibt, wie CORIA Ihre persönlichen Daten sammelt, verwendet und schützt.",
      sections: {
        dataCollection: {
          title: "Datenerfassung",
          content: "Wir sammeln Informationen, die Sie uns zur Verfügung stellen, wenn Sie CORIA verwenden, einschließlich:"
        },
        dataUsage: {
          title: "Datenverwendung",
          content: "Wir verwenden Ihre Daten, um:"
        },
        dataProtection: {
          title: "Datenschutz",
          content: "Wir implementieren geeignete Sicherheitsmaßnahmen zum Schutz Ihrer persönlichen Daten."
        },
        yourRights: {
          title: "Ihre Rechte",
          content: "Sie haben das Recht auf Zugang, Berichtigung oder Löschung Ihrer persönlichen Daten."
        },
        cookies: {
          title: "Cookies",
          content: "Wir verwenden Cookies, um Ihr Erlebnis auf unserer Plattform zu verbessern."
        },
        thirdParty: {
          title: "Dienste Dritter",
          content: "Wir können Dienste Dritter verwenden, die eigene Datenschutzrichtlinien haben."
        },
        contact: {
          title: "Kontakt",
          content: "Wenn Sie Fragen zu dieser Datenschutzerklärung haben, kontaktieren Sie uns bitte."
        }
      }
    }
  },
  contact: {
    form: {
      name: { label: "Name", placeholder: "Ihr vollständiger Name" },
      email: { label: "E-Mail", placeholder: "ihre.email@beispiel.de" },
      subject: { label: "Betreff", placeholder: "Womit können wir helfen?" },
      message: { label: "Nachricht", placeholder: "Teilen Sie uns mit, wie wir helfen können..." },
      submit: "Nachricht senden",
      sending: "Wird gesendet...",
      success: "Nachricht erfolgreich gesendet!",
      error: "Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut."
    },
    info: {
      title: "Kontaktinformationen",
      email: "E-Mail",
      phone: "Telefon",
      address: "Adresse",
      followUs: "Folgen Sie uns"
    }
  }
};

const dePath = path.join(messagesDir, 'de.json');
const deContent = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Deep merge function
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

deepMerge(deContent, deTranslations);

fs.writeFileSync(dePath, JSON.stringify(deContent, null, 2) + '\n', 'utf8');

console.log('✅ German translations added!');
console.log(`📊 File updated: ${dePath}`);
