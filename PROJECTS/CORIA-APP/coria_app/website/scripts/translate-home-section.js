#!/usr/bin/env node

/**
 * Translation script for home section
 * Translates English home section to German and French
 */

const fs = require('fs');
const path = require('path');

// German translations for home section
const homeDE = {
  "hero": {
    "badge": "Mit Herz wählen · Mit Wirkung leben",
    "title": "Sehen Sie die Wirkung hinter jedem Produkt. Treffen Sie bessere Entscheidungen.",
    "subtitle": "Vegan, Allergene, Gesundheit, Kohlenstoff-/Wasserfußabdruck und ethische Bewertungen — auf einen Blick.",
    "downloadIos": "Im App Store herunterladen",
    "downloadAndroid": "Bei Google Play herunterladen",
    "watchDemo": "Demo ansehen",
    "stats": [
      {
        "value": "2.5B+",
        "label": "Multi-Source-Produktdaten und -Inhalte"
      },
      {
        "value": "360°",
        "label": "Vegan-, Gesundheits-, ESG- und Boykott-Bewertungen"
      },
      {
        "value": "180+",
        "label": "Marken-, Markt- und Zertifizierungspartnerschaften"
      }
    ],
    "pills": [
      {
        "icon": "🧬",
        "label": "Vegan- & Allergenanalyse"
      },
      {
        "icon": "🌍",
        "label": "ESG & Boykottwarnungen"
      },
      {
        "icon": "💚",
        "label": "Gesundheits- & Ernährungsbewertungen"
      },
      {
        "icon": "🔬",
        "label": "Inhaltsstoffransparenz"
      }
    ]
  },
  "featureHighlights": {
    "title": "Alles, was Sie für bewusste Entscheidungen brauchen",
    "subtitle": "Von Barcode-Scanning bis KI-gestützter Analyse — CORIA gibt Ihnen die Werkzeuge, um mit jedem Einkauf etwas zu bewirken.",
    "features": [
      {
        "icon": "📱",
        "title": "Sofortiges Scannen",
        "description": "Scannen Sie jeden Barcode, um sofort detaillierte Nachhaltigkeits-, Gesundheits- und ethische Bewertungen zu erhalten."
      },
      {
        "icon": "🤖",
        "title": "KI-gestützte Erkenntnisse",
        "description": "Erhalten Sie personalisierte Empfehlungen und verstehen Sie die Umweltauswirkungen jedes Produkts."
      },
      {
        "icon": "🌱",
        "title": "Vegane Verifizierung",
        "description": "Überprüfen Sie sofort den veganen Status und Allergeninformationen von Millionen von Produkten."
      },
      {
        "icon": "📊",
        "title": "Wirkungsverfolg",
        "description": "Sehen Sie Ihre gesamten Einsparungen an CO2, Wasser und ethischen Entscheidungen im Laufe der Zeit."
      }
    ]
  },
  "demo": {
    "title": "Sehen Sie CORIA in Aktion",
    "subtitle": "Erleben Sie, wie einfach es ist, informierte, nachhaltige Entscheidungen mit CORIA zu treffen.",
    "videoPlaceholder": "Demo-Video",
    "features": [
      "Scannen Sie jeden Barcode sofort",
      "Sehen Sie detaillierte Nachhaltigkeitsbewertungen",
      "Erhalten Sie personalisierte Empfehlungen",
      "Verfolgen Sie Ihre Wirkung im Laufe der Zeit"
    ]
  },
  "impact": {
    "title": "Ihre Auswirkung zählt",
    "subtitle": "Schließen Sie sich Tausenden von Nutzern an, die mit CORIA einen Unterschied machen.",
    "stats": [
      {
        "value": "15M+",
        "label": "Gescannte Produkte",
        "description": "Millionen von Produkten von Nutzern weltweit gescannt"
      },
      {
        "value": "2.5M kg",
        "label": "CO2 eingespart",
        "description": "Geschätzte CO2-Einsparungen durch nachhaltige Entscheidungen"
      },
      {
        "value": "50M L",
        "label": "Wasser eingespart",
        "description": "Geschätzte Wassereinsparungen durch bewussten Konsum"
      },
      {
        "value": "180+",
        "label": "Länder",
        "description": "Globale Community nachhaltiger Verbraucher"
      }
    ]
  },
  "audiences": {
    "title": "Für jeden gemacht",
    "subtitle": "Ob Sie Veganer, gesundheitsbewusst oder umweltbewusst sind — CORIA hilft Ihnen, bessere Entscheidungen zu treffen.",
    "segments": [
      {
        "icon": "🌱",
        "title": "Veganer & Vegetarier",
        "description": "Verifizieren Sie sofort den veganen Status und finden Sie pflanzliche Alternativen zu Ihren Lieblingsprodukten.",
        "features": ["Vegane Verifizierung", "Pflanzliche Alternativen", "Allergeninformationen"]
      },
      {
        "icon": "💚",
        "title": "Gesundheitsbewusste",
        "description": "Verstehen Sie Inhaltsstoffe, Nährwertinformationen und gesundheitliche Auswirkungen jedes Produkts.",
        "features": ["Inhaltsstoffanalyse", "Nährwertbewertungen", "Gesundheitswarnungen"]
      },
      {
        "icon": "🌍",
        "title": "Umweltbewusste",
        "description": "Verfolgen Sie CO2-, Wasser- und ethische Auswirkungen und treffen Sie nachhaltigere Entscheidungen.",
        "features": ["Umweltauswirkungen", "Nachhaltigkeitsbewertungen", "Ethische Verifizierung"]
      }
    ]
  },
  "socialProof": {
    "title": "Von Tausenden vertraut",
    "subtitle": "Sehen Sie, was unsere Community über CORIA sagt.",
    "testimonials": [
      {
        "quote": "CORIA hat meine Einkaufsgewohnheiten völlig verändert. Ich weiß jetzt genau, was ich kaufe und welche Auswirkungen es hat.",
        "author": "Sarah M.",
        "role": "Vegane Verfechterin",
        "rating": 5,
        "avatar": "SM"
      },
      {
        "quote": "Die KI-gestützten Empfehlungen sind unglaublich. Ich habe so viele großartige nachhaltige Produkte entdeckt, von denen ich nie gewusst hätte.",
        "author": "Michael K.",
        "role": "Umweltschützer",
        "rating": 5,
        "avatar": "MK"
      },
      {
        "quote": "Als jemand mit mehreren Allergien ist CORIA lebensrettend. Ich kann Produkte sofort scannen und sehen, ob sie für mich sicher sind.",
        "author": "Emily R.",
        "role": "Gesundheitsbewusste Verbraucherin",
        "rating": 5,
        "avatar": "ER"
      }
    ]
  },
  "faq": {
    "title": "Häufig gestellte Fragen",
    "subtitle": "Finden Sie Antworten auf häufige Fragen zu CORIA.",
    "items": [
      {
        "question": "Wie genau sind die Nachhaltigkeitsbewertungen?",
        "answer": "Unsere Bewertungen basieren auf mehreren verifizierten Datenquellen, darunter offizielle Zertifizierungen, Herstellerangaben und Datenbanken von Drittanbietern. Wir aktualisieren unsere Daten kontinuierlich, um Genauigkeit zu gewährleisten."
      },
      {
        "question": "Welche Produkte kann ich mit CORIA scannen?",
        "answer": "CORIA unterstützt Millionen von Produkten weltweit, einschließlich Lebensmittel, Getränke, Körperpflege, Haushaltsprodukte und mehr. Wenn ein Produkt einen Barcode hat, können Sie es scannen!"
      },
      {
        "question": "Ist CORIA in meinem Land verfügbar?",
        "answer": "CORIA ist in über 180 Ländern weltweit verfügbar. Während einige Funktionen je nach Region variieren können, funktioniert die Kern-Barcode-Scanfunktion überall."
      },
      {
        "question": "Wie unterscheidet sich CORIA von anderen Scan-Apps?",
        "answer": "CORIA bietet umfassende Nachhaltigkeitsbewertungen über mehrere Dimensionen — vegan, Gesundheit, Umwelt und Ethik. Unsere KI-gestützten Erkenntnisse und personalisierten Empfehlungen machen uns einzigartig."
      },
      {
        "question": "Ist meine Daten bei CORIA sicher?",
        "answer": "Absolut. Wir nehmen Datenschutz ernst und verkaufen Ihre Daten niemals. Alle Daten werden sicher gespeichert und Sie haben die volle Kontrolle über Ihre Informationen."
      }
    ]
  },
  "cta": {
    "title": "Bereit, einen Unterschied zu machen?",
    "subtitle": "Schließen Sie sich Tausenden an, die mit CORIA nachhaltigere Entscheidungen treffen.",
    "downloadIos": "Im App Store herunterladen",
    "downloadAndroid": "Bei Google Play herunterladen",
    "badge": "100% kostenlos · Keine Kreditkarte erforderlich"
  },
  "blog": {
    "title": "Neueste Erkenntnisse",
    "subtitle": "Entdecken Sie Tipps, Leitfäden und Geschichten für nachhaltigeres Leben.",
    "viewAll": "Alle Artikel ansehen",
    "readMore": "Weiterlesen",
    "minuteRead": "Min. Lesezeit"
  }
};

// French translations for home section
const homeFR = {
  "hero": {
    "badge": "Choisir avec le cœur · Vivre avec impact",
    "title": "Voyez l'impact derrière chaque produit. Faites de meilleurs choix.",
    "subtitle": "Scores végans, allergènes, santé, carbone/eau et éthiques — en un coup d'œil.",
    "downloadIos": "Télécharger sur l'App Store",
    "downloadAndroid": "Disponible sur Google Play",
    "watchDemo": "Voir la démo",
    "stats": [
      {
        "value": "2.5B+",
        "label": "Données et contenus de produits multi-sources"
      },
      {
        "value": "360°",
        "label": "Scores végan, santé, ESG et boycott"
      },
      {
        "value": "180+",
        "label": "Partenariats marques, marchés et certifications"
      }
    ],
    "pills": [
      {
        "icon": "🧬",
        "label": "Analyse végan & allergènes"
      },
      {
        "icon": "🌍",
        "label": "Alertes ESG & boycott"
      },
      {
        "icon": "💚",
        "label": "Scores santé & nutrition"
      },
      {
        "icon": "🔬",
        "label": "Transparence des ingrédients"
      }
    ]
  },
  "featureHighlights": {
    "title": "Tout ce dont vous avez besoin pour des choix conscients",
    "subtitle": "Du scan de code-barres à l'analyse alimentée par l'IA — CORIA vous donne les outils pour avoir un impact à chaque achat.",
    "features": [
      {
        "icon": "📱",
        "title": "Scan instantané",
        "description": "Scannez n'importe quel code-barres pour obtenir instantanément des scores détaillés de durabilité, santé et éthique."
      },
      {
        "icon": "🤖",
        "title": "Insights alimentés par l'IA",
        "description": "Obtenez des recommandations personnalisées et comprenez l'impact environnemental de chaque produit."
      },
      {
        "icon": "🌱",
        "title": "Vérification végane",
        "description": "Vérifiez instantanément le statut végan et les informations allergènes de millions de produits."
      },
      {
        "icon": "📊",
        "title": "Suivi d'impact",
        "description": "Voyez votre économie totale de CO2, d'eau et de choix éthiques au fil du temps."
      }
    ]
  },
  "demo": {
    "title": "Voyez CORIA en action",
    "subtitle": "Découvrez à quel point il est facile de prendre des décisions éclairées et durables avec CORIA.",
    "videoPlaceholder": "Vidéo de démonstration",
    "features": [
      "Scannez n'importe quel code-barres instantanément",
      "Voyez des scores de durabilité détaillés",
      "Obtenez des recommandations personnalisées",
      "Suivez votre impact au fil du temps"
    ]
  },
  "impact": {
    "title": "Votre impact compte",
    "subtitle": "Rejoignez des milliers d'utilisateurs qui font la différence avec CORIA.",
    "stats": [
      {
        "value": "15M+",
        "label": "Produits scannés",
        "description": "Des millions de produits scannés par des utilisateurs du monde entier"
      },
      {
        "value": "2.5M kg",
        "label": "CO2 économisé",
        "description": "Économies de CO2 estimées grâce à des choix durables"
      },
      {
        "value": "50M L",
        "label": "Eau économisée",
        "description": "Économies d'eau estimées grâce à une consommation consciente"
      },
      {
        "value": "180+",
        "label": "Pays",
        "description": "Communauté mondiale de consommateurs durables"
      }
    ]
  },
  "audiences": {
    "title": "Conçu pour tous",
    "subtitle": "Que vous soyez végan, soucieux de votre santé ou de l'environnement — CORIA vous aide à faire de meilleurs choix.",
    "segments": [
      {
        "icon": "🌱",
        "title": "Végans & Végétariens",
        "description": "Vérifiez instantanément le statut végan et trouvez des alternatives végétales à vos produits préférés.",
        "features": ["Vérification végane", "Alternatives végétales", "Informations allergènes"]
      },
      {
        "icon": "💚",
        "title": "Soucieux de la santé",
        "description": "Comprenez les ingrédients, les informations nutritionnelles et l'impact sanitaire de chaque produit.",
        "features": ["Analyse des ingrédients", "Scores nutritionnels", "Alertes santé"]
      },
      {
        "icon": "🌍",
        "title": "Éco-conscients",
        "description": "Suivez l'impact carbone, eau et éthique, et faites des choix plus durables.",
        "features": ["Impact environnemental", "Scores de durabilité", "Vérification éthique"]
      }
    ]
  },
  "socialProof": {
    "title": "Approuvé par des milliers",
    "subtitle": "Voyez ce que notre communauté dit de CORIA.",
    "testimonials": [
      {
        "quote": "CORIA a complètement transformé mes habitudes d'achat. Je sais maintenant exactement ce que j'achète et son impact.",
        "author": "Sarah M.",
        "role": "Militante végane",
        "rating": 5,
        "avatar": "SM"
      },
      {
        "quote": "Les recommandations alimentées par l'IA sont incroyables. J'ai découvert tant de super produits durables dont je n'aurais jamais su l'existence.",
        "author": "Michael K.",
        "role": "Défenseur de l'environnement",
        "rating": 5,
        "avatar": "MK"
      },
      {
        "quote": "En tant que personne avec plusieurs allergies, CORIA sauve des vies. Je peux scanner des produits instantanément et voir s'ils sont sûrs pour moi.",
        "author": "Emily R.",
        "role": "Consommatrice soucieuse de sa santé",
        "rating": 5,
        "avatar": "ER"
      }
    ]
  },
  "faq": {
    "title": "Questions fréquemment posées",
    "subtitle": "Trouvez des réponses aux questions courantes sur CORIA.",
    "items": [
      {
        "question": "Quelle est la précision des scores de durabilité?",
        "answer": "Nos scores sont basés sur plusieurs sources de données vérifiées, y compris des certifications officielles, des déclarations de fabricants et des bases de données tierces. Nous mettons continuellement à jour nos données pour garantir la précision."
      },
      {
        "question": "Quels produits puis-je scanner avec CORIA?",
        "answer": "CORIA prend en charge des millions de produits dans le monde, y compris aliments, boissons, soins corporels, produits ménagers et plus encore. Si un produit a un code-barres, vous pouvez le scanner!"
      },
      {
        "question": "CORIA est-il disponible dans mon pays?",
        "answer": "CORIA est disponible dans plus de 180 pays dans le monde. Bien que certaines fonctionnalités puissent varier selon la région, la fonctionnalité de scan de code-barres principale fonctionne partout."
      },
      {
        "question": "En quoi CORIA est-il différent des autres applications de scan?",
        "answer": "CORIA offre des scores de durabilité complets sur plusieurs dimensions — végan, santé, environnement et éthique. Nos insights alimentés par l'IA et recommandations personnalisées nous rendent uniques."
      },
      {
        "question": "Mes données sont-elles en sécurité avec CORIA?",
        "answer": "Absolument. Nous prenons la confidentialité au sérieux et ne vendons jamais vos données. Toutes les données sont stockées en toute sécurité et vous avez le contrôle total de vos informations."
      }
    ]
  },
  "cta": {
    "title": "Prêt à faire la différence?",
    "subtitle": "Rejoignez des milliers de personnes qui font des choix plus durables avec CORIA.",
    "downloadIos": "Télécharger sur l'App Store",
    "downloadAndroid": "Disponible sur Google Play",
    "badge": "100% gratuit · Aucune carte de crédit requise"
  },
  "blog": {
    "title": "Dernières insights",
    "subtitle": "Découvrez des conseils, guides et histoires pour une vie plus durable.",
    "viewAll": "Voir tous les articles",
    "readMore": "Lire la suite",
    "minuteRead": "min de lecture"
  }
};

// Load and update locale files
function updateLocaleFile(locale, homeSection) {
  const filePath = path.join(__dirname, `../src/messages/${locale}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  content.home = homeSection;
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated ${locale}.json with translated home section`);
}

// Execute translations
console.log('🌍 Translating home section...\n');
updateLocaleFile('de', homeDE);
updateLocaleFile('fr', homeFR);
console.log('\n✨ Translation complete!');
