#!/usr/bin/env node

/**
 * Complete all missing translations for DE and FR
 * This script adds all missing keys from TR to EN, DE, and FR
 */

const fs = require('fs');
const path = require('path');

// Load all locale files
const tr = require('../src/messages/tr.json');
const en = require('../src/messages/en.json');
const de = require('../src/messages/de.json');
const fr = require('../src/messages/fr.json');

// English translations for missing keys
const enAdditions = {
  "features": {
    "barcodeScan": {
      "title": "Barcode Scanning",
      "description": "Instantly learn the sustainability scores of products"
    },
    "aiRecommendations": {
      "title": "AI Recommendations",
      "description": "Get personalized sustainable product recommendations"
    },
    "impactTracking": {
      "title": "Impact Tracking",
      "description": "Track your carbon footprint and environmental impact"
    },
    "smartPantry": {
      "title": "Smart Pantry",
      "description": "Reduce food waste and shop smartly"
    }
  }
};

// German translations for ALL missing sections
const deAdditions = {
  "navigation": {
    "foundation": "Foundation",
    "downloadApp": "CORIA App herunterladen",
    "sustainableLiving": "Nachhaltiges Leben leicht gemacht"
  },
  "features": {
    "barcodeScan": {
      "title": "Barcode-Scanning",
      "description": "Erfahren Sie sofort die Nachhaltigkeitsbewertungen von Produkten"
    },
    "aiRecommendations": {
      "title": "KI-Empfehlungen",
      "description": "Erhalten Sie personalisierte nachhaltige Produktempfehlungen"
    },
    "impactTracking": {
      "title": "Impact-Tracking",
      "description": "Verfolgen Sie Ihren CO2-Fußabdruck und Ihre Umweltauswirkungen"
    },
    "smartPantry": {
      "title": "Intelligente Speisekammer",
      "description": "Reduzieren Sie Lebensmittelverschwendung und kaufen Sie intelligent ein"
    },
    "meta": {
      "title": "CORIA Funktionen - Nachhaltiges Leben leicht gemacht",
      "description": "Entdecken Sie CORIAs leistungsstarke Funktionen, einschließlich Barcode-Scanning, KI-Empfehlungen, Impact-Tracking und intelligente Speisekammer für nachhaltiges Leben."
    },
    "sidebar": {
      "title": "Funktionskategorien"
    },
    "navigation": {
      "allFeatures": "Alle Funktionen",
      "backToCategory": "Zurück zur Kategorie"
    },
    "overview": {
      "title": "Leistungsstarke Funktionen für nachhaltiges Leben",
      "subtitle": "Entdecken Sie, wie CORIAs umfassendes Funktionsangebot Ihnen hilft, bewusste Konsumentscheidungen zu treffen und Ihre Umweltauswirkungen zu verfolgen.",
      "learnMore": "Mehr erfahren",
      "cta": {
        "title": "Bereit, Ihre nachhaltige Reise zu beginnen?",
        "description": "Laden Sie CORIA noch heute herunter und beginnen Sie, bewusste Konsumentscheidungen zu treffen.",
        "downloadIos": "Im App Store herunterladen",
        "downloadAndroid": "Bei Google Play herunterladen"
      }
    },
    "categoryOverview": {
      "featuresTitle": "Funktionen in dieser Kategorie",
      "relatedTitle": "Verwandte Kategorien",
      "cta": {
        "title": "Erleben Sie diese Funktionen",
        "description": "Laden Sie CORIA herunter, um auf alle diese leistungsstarken Nachhaltigkeitsfunktionen zuzugreifen.",
        "downloadIos": "Im App Store herunterladen",
        "downloadAndroid": "Bei Google Play herunterladen"
      }
    },
    "featureDetail": {
      "howItWorks": {
        "title": "Wie es funktioniert"
      },
      "technicalDetails": {
        "title": "Technische Details"
      },
      "learnMore": "Mehr erfahren",
      "cta": {
        "title": "Probieren Sie diese Funktion aus",
        "description": "Laden Sie CORIA herunter, um diese und viele weitere Funktionen zu erleben.",
        "downloadIos": "Im App Store herunterladen",
        "downloadAndroid": "Bei Google Play herunterladen"
      }
    },
    "gallery": {
      "title": "Sehen Sie es in Aktion",
      "watchDemo": "Demo ansehen",
      "videoPlaceholder": "Demo-Video kommt bald"
    },
    "whyItMatters": {
      "title": "Warum das wichtig ist",
      "statisticsTitle": "Impact-Statistiken",
      "joinMovement": "Schließen Sie sich der Bewegung für nachhaltiges Leben an",
      "impactTypes": {
        "environmental": "Umwelt",
        "health": "Gesundheit",
        "social": "Sozial",
        "economic": "Wirtschaftlich"
      }
    },
    "methodology": {
      "title": "Unsere Methodik",
      "subtitle": "Wie wir Nachhaltigkeitsbewertungen berechnen",
      "dataSourcesTitle": "Datenquellen",
      "calculationTitle": "Berechnungsprozess",
      "transparencyNote": "Wir glauben an vollständige Transparenz in unseren Bewertungsmethoden."
    },
    "dataSources": {
      "title": "Vertrauenswürdige Datenquellen",
      "subtitle": "Wir arbeiten mit den weltweit führenden Nachhaltigkeitsdatenbanken zusammen",
      "attribution": "Daten bereitgestellt von"
    },
    "relatedFeatures": {
      "title": "Verwandte Funktionen",
      "exploreMore": "Weitere Funktionen erkunden"
    },
    "categories": {
      "scanning": {
        "name": "Scannen & Erkennung",
        "description": "Sofortige Produktanalyse und Erkennung"
      },
      "analysis": {
        "name": "Analyse & Einblicke",
        "description": "Tiefgehende Nachhaltigkeits- und Gesundheitsanalyse"
      },
      "tracking": {
        "name": "Tracking & Berichte",
        "description": "Überwachen Sie Ihre Auswirkungen im Laufe der Zeit"
      },
      "recommendations": {
        "name": "Empfehlungen",
        "description": "Personalisierte nachhaltige Produktvorschläge"
      },
      "community": {
        "name": "Community",
        "description": "Teilen und lernen Sie von anderen"
      }
    },
    "features": {
      "barcodeScanner": {
        "name": "Barcode-Scanner",
        "description": "Scannen Sie jeden Barcode für sofortige Produktinformationen",
        "category": "scanning"
      },
      "productRecognition": {
        "name": "Produkterkennung",
        "description": "KI-gestützte Produktidentifikation",
        "category": "scanning"
      },
      "veganAnalysis": {
        "name": "Vegane Analyse",
        "description": "Sofortige vegane Verifizierung und Allergeninformationen",
        "category": "analysis"
      },
      "healthScore": {
        "name": "Gesundheitsbewertung",
        "description": "Umfassende Ernährungs- und Gesundheitsanalyse",
        "category": "analysis"
      },
      "carbonFootprint": {
        "name": "CO2-Fußabdruck",
        "description": "Berechnen Sie die Umweltauswirkungen von Produkten",
        "category": "analysis"
      },
      "impactDashboard": {
        "name": "Impact-Dashboard",
        "description": "Visualisieren Sie Ihre gesamten Nachhaltigkeitseinsparungen",
        "category": "tracking"
      },
      "purchaseHistory": {
        "name": "Kaufhistorie",
        "description": "Verfolgen Sie Ihre Einkäufe und Trends",
        "category": "tracking"
      },
      "aiRecommendations": {
        "name": "KI-Empfehlungen",
        "description": "Personalisierte Produktvorschläge",
        "category": "recommendations"
      },
      "alternatives": {
        "name": "Nachhaltige Alternativen",
        "description": "Finden Sie umweltfreundlichere Optionen",
        "category": "recommendations"
      },
      "shareImpact": {
        "name": "Impact teilen",
        "description": "Teilen Sie Ihre Nachhaltigkeitsreise",
        "category": "community"
      }
    }
  },
  "pricing": {
    "meta": {
      "title": "Preise - CORIA",
      "description": "Wählen Sie den perfekten Plan für Ihre nachhaltige Lebensreise. Kostenlos anfangen oder mit Premium upgraden."
    },
    "plans": {
      "free": {
        "name": "Kostenlos",
        "price": "0",
        "period": "für immer",
        "description": "Perfekt für den Einstieg in Ihre nachhaltige Reise",
        "features": [
          "Unbegrenzte Barcode-Scans",
          "Basis-Nachhaltigkeitsbewertungen",
          "Vegane Verifizierung",
          "Community-Zugang"
        ],
        "cta": "Kostenlos anfangen"
      },
      "premium": {
        "name": "Premium",
        "price": "49",
        "period": "pro Monat",
        "description": "Für ernsthafte nachhaltige Verbraucher",
        "features": [
          "Alles in Kostenlos",
          "Erweiterte KI-Einblicke",
          "Detaillierte Impact-Berichte",
          "Einkaufslisten & Rezepte",
          "Prioritätssupport",
          "Werbefreie Erfahrung"
        ],
        "cta": "Premium holen",
        "popular": "Beliebt"
      }
    },
    "comparison": {
      "title": "Plan-Vergleich",
      "subtitle": "Finden Sie den richtigen Plan für Ihre Bedürfnisse",
      "features": "Funktionen"
    },
    "trust": {
      "title": "Vertraut von Tausenden",
      "moneyBack": "30-Tage-Geld-zurück-Garantie",
      "securePayment": "Sichere Zahlung",
      "cancelAnytime": "Jederzeit kündbar"
    }
  },
  "about": {
    "meta": {
      "title": "Über uns - CORIA",
      "description": "Erfahren Sie mehr über CORIAs Mission, nachhaltiges Leben für alle zugänglich zu machen."
    }
  },
  "blog": {
    "meta": {
      "title": "Blog - CORIA",
      "description": "Tipps, Leitfäden und Geschichten für nachhaltiges Leben."
    }
  },
  "contact": {
    "meta": {
      "title": "Kontakt - CORIA",
      "description": "Kontaktieren Sie uns. Wir helfen Ihnen gerne weiter."
    }
  }
};

// French translations for ALL missing sections
const frAdditions = {
  "navigation": {
    "foundation": "Foundation",
    "downloadApp": "Télécharger l'application CORIA",
    "sustainableLiving": "Une vie durable simplifiée"
  },
  "features": {
    "barcodeScan": {
      "title": "Scan de code-barres",
      "description": "Découvrez instantanément les scores de durabilité des produits"
    },
    "aiRecommendations": {
      "title": "Recommandations IA",
      "description": "Obtenez des recommandations de produits durables personnalisées"
    },
    "impactTracking": {
      "title": "Suivi d'impact",
      "description": "Suivez votre empreinte carbone et votre impact environnemental"
    },
    "smartPantry": {
      "title": "Garde-manger intelligent",
      "description": "Réduisez le gaspillage alimentaire et faites des achats intelligents"
    },
    "meta": {
      "title": "Fonctionnalités CORIA - Vie durable simplifiée",
      "description": "Découvrez les fonctionnalités puissantes de CORIA, notamment le scan de code-barres, les recommandations IA, le suivi d'impact et la gestion intelligente du garde-manger pour une vie durable."
    },
    "sidebar": {
      "title": "Catégories de fonctionnalités"
    },
    "navigation": {
      "allFeatures": "Toutes les fonctionnalités",
      "backToCategory": "Retour à la catégorie"
    },
    "overview": {
      "title": "Fonctionnalités puissantes pour une vie durable",
      "subtitle": "Découvrez comment l'ensemble complet de fonctionnalités de CORIA vous aide à faire des choix de consommation conscients et à suivre votre impact environnemental.",
      "learnMore": "En savoir plus",
      "cta": {
        "title": "Prêt à commencer votre voyage durable?",
        "description": "Téléchargez CORIA aujourd'hui et commencez à faire des choix de consommation conscients.",
        "downloadIos": "Télécharger sur l'App Store",
        "downloadAndroid": "Disponible sur Google Play"
      }
    },
    "categoryOverview": {
      "featuresTitle": "Fonctionnalités de cette catégorie",
      "relatedTitle": "Catégories associées",
      "cta": {
        "title": "Découvrez ces fonctionnalités",
        "description": "Téléchargez CORIA pour accéder à toutes ces puissantes fonctionnalités de durabilité.",
        "downloadIos": "Télécharger sur l'App Store",
        "downloadAndroid": "Disponible sur Google Play"
      }
    },
    "featureDetail": {
      "howItWorks": {
        "title": "Comment ça marche"
      },
      "technicalDetails": {
        "title": "Détails techniques"
      },
      "learnMore": "En savoir plus",
      "cta": {
        "title": "Essayez cette fonctionnalité",
        "description": "Téléchargez CORIA pour découvrir cette fonctionnalité et bien d'autres.",
        "downloadIos": "Télécharger sur l'App Store",
        "downloadAndroid": "Disponible sur Google Play"
      }
    },
    "gallery": {
      "title": "Voyez-le en action",
      "watchDemo": "Voir la démo",
      "videoPlaceholder": "Vidéo de démo bientôt disponible"
    },
    "whyItMatters": {
      "title": "Pourquoi c'est important",
      "statisticsTitle": "Statistiques d'impact",
      "joinMovement": "Rejoignez le mouvement pour une vie durable",
      "impactTypes": {
        "environmental": "Environnemental",
        "health": "Santé",
        "social": "Social",
        "economic": "Économique"
      }
    },
    "methodology": {
      "title": "Notre méthodologie",
      "subtitle": "Comment nous calculons les scores de durabilité",
      "dataSourcesTitle": "Sources de données",
      "calculationTitle": "Processus de calcul",
      "transparencyNote": "Nous croyons en la transparence totale de nos méthodes de notation."
    },
    "dataSources": {
      "title": "Sources de données fiables",
      "subtitle": "Nous nous associons aux principales bases de données de durabilité du monde",
      "attribution": "Données fournies par"
    },
    "relatedFeatures": {
      "title": "Fonctionnalités associées",
      "exploreMore": "Explorer plus de fonctionnalités"
    },
    "categories": {
      "scanning": {
        "name": "Scan & Reconnaissance",
        "description": "Analyse et reconnaissance instantanées des produits"
      },
      "analysis": {
        "name": "Analyse & Insights",
        "description": "Analyse approfondie de la durabilité et de la santé"
      },
      "tracking": {
        "name": "Suivi & Rapports",
        "description": "Surveillez votre impact au fil du temps"
      },
      "recommendations": {
        "name": "Recommandations",
        "description": "Suggestions de produits durables personnalisées"
      },
      "community": {
        "name": "Communauté",
        "description": "Partagez et apprenez des autres"
      }
    },
    "features": {
      "barcodeScanner": {
        "name": "Scanner de code-barres",
        "description": "Scannez n'importe quel code-barres pour des informations instantanées sur le produit",
        "category": "scanning"
      },
      "productRecognition": {
        "name": "Reconnaissance de produit",
        "description": "Identification de produit alimentée par l'IA",
        "category": "scanning"
      },
      "veganAnalysis": {
        "name": "Analyse végane",
        "description": "Vérification végane instantanée et informations sur les allergènes",
        "category": "analysis"
      },
      "healthScore": {
        "name": "Score santé",
        "description": "Analyse nutritionnelle et sanitaire complète",
        "category": "analysis"
      },
      "carbonFootprint": {
        "name": "Empreinte carbone",
        "description": "Calculez l'impact environnemental des produits",
        "category": "analysis"
      },
      "impactDashboard": {
        "name": "Tableau de bord d'impact",
        "description": "Visualisez vos économies totales de durabilité",
        "category": "tracking"
      },
      "purchaseHistory": {
        "name": "Historique d'achat",
        "description": "Suivez vos achats et tendances",
        "category": "tracking"
      },
      "aiRecommendations": {
        "name": "Recommandations IA",
        "description": "Suggestions de produits personnalisées",
        "category": "recommendations"
      },
      "alternatives": {
        "name": "Alternatives durables",
        "description": "Trouvez des options plus respectueuses de l'environnement",
        "category": "recommendations"
      },
      "shareImpact": {
        "name": "Partager l'impact",
        "description": "Partagez votre parcours de durabilité",
        "category": "community"
      }
    }
  },
  "pricing": {
    "meta": {
      "title": "Tarifs - CORIA",
      "description": "Choisissez le plan parfait pour votre parcours de vie durable. Commencez gratuitement ou passez à Premium."
    },
    "plans": {
      "free": {
        "name": "Gratuit",
        "price": "0",
        "period": "pour toujours",
        "description": "Parfait pour commencer votre parcours durable",
        "features": [
          "Scans de codes-barres illimités",
          "Scores de durabilité de base",
          "Vérification végane",
          "Accès communautaire"
        ],
        "cta": "Commencer gratuitement"
      },
      "premium": {
        "name": "Premium",
        "price": "49",
        "period": "par mois",
        "description": "Pour les consommateurs durables sérieux",
        "features": [
          "Tout ce qui est dans Gratuit",
          "Insights IA avancés",
          "Rapports d'impact détaillés",
          "Listes de courses & recettes",
          "Support prioritaire",
          "Expérience sans publicité"
        ],
        "cta": "Obtenir Premium",
        "popular": "Populaire"
      }
    },
    "comparison": {
      "title": "Comparaison des plans",
      "subtitle": "Trouvez le bon plan pour vos besoins",
      "features": "Fonctionnalités"
    },
    "trust": {
      "title": "Approuvé par des milliers",
      "moneyBack": "Garantie de remboursement de 30 jours",
      "securePayment": "Paiement sécurisé",
      "cancelAnytime": "Annulez à tout moment"
    }
  },
  "about": {
    "meta": {
      "title": "À propos - CORIA",
      "description": "Découvrez la mission de CORIA : rendre la vie durable accessible à tous."
    }
  },
  "blog": {
    "meta": {
      "title": "Blog - CORIA",
      "description": "Conseils, guides et histoires pour une vie durable."
    }
  },
  "contact": {
    "meta": {
      "title": "Contact - CORIA",
      "description": "Contactez-nous. Nous sommes là pour vous aider."
    }
  }
};

// Deep merge function
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = target[key] || {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Update locale files
function updateLocaleFile(locale, additions) {
  const filePath = path.join(__dirname, `../src/messages/${locale}.json`);
  let content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  content = deepMerge(content, additions);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated ${locale}.json`);
}

// Execute
console.log('🌍 Completing all translations...\n');
updateLocaleFile('en', enAdditions);
updateLocaleFile('de', deAdditions);
updateLocaleFile('fr', frAdditions);
console.log('\n✨ All translations completed!');
