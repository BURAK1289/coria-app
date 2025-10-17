#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const messagesDir = path.join(__dirname, '../src/messages');

console.log('🇫🇷 Adding ALL missing French translations...\n');

const frTranslations = {
  navigation: {
    foundation: "Foundation",
    downloadApp: "Télécharger l'application CORIA",
    sustainableLiving: "Vie durable simplifiée"
  },
  features: {
    sidebar: {
      title: "Explorer les fonctionnalités"
    },
    navigation: {
      allFeatures: "Toutes les fonctionnalités",
      backToCategory: "Retour à la catégorie"
    },
    overview: {
      title: "Toutes les fonctionnalités",
      subtitle: "Découvrez les outils puissants de CORIA pour une vie durable",
      learnMore: "En savoir plus",
      cta: {
        title: "Prêt à commencer ?",
        description: "Téléchargez CORIA et commencez votre voyage vers une vie durable aujourd'hui",
        downloadIos: "Télécharger pour iOS",
        downloadAndroid: "Télécharger pour Android"
      }
    },
    categoryOverview: {
      featuresTitle: "Fonctionnalités dans cette catégorie",
      relatedTitle: "Fonctionnalités associées",
      cta: {
        title: "Essayer ces fonctionnalités",
        description: "Téléchargez CORIA et découvrez toutes les fonctionnalités",
        downloadIos: "Télécharger pour iOS",
        downloadAndroid: "Télécharger pour Android"
      }
    },
    featureDetail: {
      howItWorks: {
        title: "Comment ça marche"
      },
      technicalDetails: {
        title: "Détails techniques"
      },
      learnMore: "En savoir plus sur cette fonctionnalité",
      cta: {
        title: "Essayer cette fonctionnalité",
        description: "Téléchargez CORIA et commencez à l'utiliser",
        downloadIos: "Télécharger pour iOS",
        downloadAndroid: "Télécharger pour Android"
      }
    },
    gallery: {
      title: "Voir en action",
      watchDemo: "Regarder la démo",
      videoPlaceholder: "Chargement de la fonctionnalité..."
    },
    whyItMatters: {
      title: "Pourquoi c'est important",
      statisticsTitle: "Statistiques d'impact",
      joinMovement: "Rejoignez le mouvement",
      impactTypes: {
        environmental: "Environnemental",
        health: "Santé",
        economic: "Économique",
        social: "Social",
        ethical: "Éthique",
        global: "Global"
      }
    },
    methodology: {
      title: "Notre méthodologie",
      scoringSystem: "Système de notation",
      scoringRange: "Plage de notation : 0-100",
      updateFrequency: "Fréquence de mise à jour",
      scoringFactors: "Facteurs de notation",
      ratings: {
        poor: "Médiocre (0-25)",
        fair: "Passable (26-50)",
        good: "Bon (51-75)",
        excellent: "Excellent (76-100)"
      },
      dataProcessing: {
        title: "Traitement des données"
      },
      transparency: {
        title: "Transparence et précision",
        description: "Notre système de notation est basé sur des données scientifiques et mis à jour régulièrement"
      },
      "environmental-score": {
        description: "Impact environnemental des produits basé sur plusieurs facteurs",
        overview: "Nous évaluons les produits selon l'empreinte carbone, l'utilisation de l'eau et les déchets",
        updateFrequency: "Mis à jour quotidiennement",
        dataProcessing: "Traitement automatique avec vérification manuelle",
        factors: [
          { description: "Émissions de CO2 pendant la production et le transport" },
          { description: "Consommation d'eau et impacts" },
          { description: "Emballage et gestion des déchets" },
          { description: "Biodiversité et utilisation des terres" },
          { description: "Analyse complète du cycle de vie" }
        ]
      },
      "social-impact": {
        description: "Évaluation de la responsabilité sociale et des pratiques éthiques",
        overview: "Évaluation des conditions de travail, du commerce équitable et de l'impact communautaire",
        updateFrequency: "Mis à jour hebdomadairement",
        dataProcessing: "Combinaison de vérifications automatisées et humaines",
        factors: [
          { description: "Pratiques de travail équitable et salaires" },
          { description: "Certifications de commerce équitable" },
          { description: "Engagement communautaire" },
          { description: "Droits humains dans la chaîne d'approvisionnement" },
          { description: "Transparence de l'impact social" }
        ]
      },
      "health-rating": {
        description: "Qualité nutritionnelle et impacts sur la santé des produits",
        overview: "Analyse des nutriments, additifs et avantages pour la santé",
        updateFrequency: "Mis à jour quotidiennement",
        dataProcessing: "Analyse nutritionnelle assistée par IA",
        factors: [
          { description: "Densité et qualité nutritionnelles" },
          { description: "Niveau de transformation" },
          { description: "Additifs et conservateurs" },
          { description: "Allergènes et compatibilité alimentaire" },
          { description: "Avantages pour la santé fondés sur des preuves" }
        ]
      },
      "ethical-production": {
        description: "Évaluation du bien-être animal et des normes de production éthique",
        overview: "Évaluation du traitement des animaux et des pratiques d'approvisionnement éthique",
        updateFrequency: "Mis à jour hebdomadairement",
        dataProcessing: "Vérification manuelle avec validation d'experts",
        factors: [
          { description: "Normes de bien-être animal" },
          { description: "Certifications et audits" },
          { description: "Transparence de la chaîne d'approvisionnement" },
          { description: "Pas de tests sur les animaux" },
          { description: "Alternatives véganes et végétales" }
        ]
      }
    },
    dataSources: {
      title: "Sources de données",
      description: "Nous utilisons des sources de données fiables pour des évaluations précises",
      verified: "Données vérifiées",
      coverage: "Couverture mondiale",
      updates: "Mises à jour régulières",
      reliability: "Note de fiabilité",
      visitSource: "Visiter la source",
      quality: {
        title: "Qualité des données",
        description: "Toutes les sources de données sont vérifiées pour leur exactitude et fiabilité"
      }
    },
    relatedFeatures: {
      title: "Fonctionnalités associées",
      exploreAll: "Explorer toutes les fonctionnalités"
    },
    categories: {
      all: "Toutes",
      scanning: "Scan",
      analysis: "Analyse",
      tracking: "Suivi",
      community: "Communauté",
      sustainability: "Durabilité"
    }
  },
  pricing: {
    free: "GRATUIT",
    premium: "PREMIUM",
    monthly: "/mois",
    features: {
      scans: { name: "Scans" },
      unlimitedScans: { name: "Scans illimités" },
      basicInsights: { name: "Informations de base" },
      advancedAnalytics: { name: "Analyses avancées" },
      aiRecommendations: { name: "Recommandations IA" },
      prioritySupport: { name: "Support prioritaire" },
      communityAccess: { name: "Accès communauté" },
      premiumCommunity: { name: "Communauté premium" },
      dataExport: { name: "Export de données" },
      customReports: { name: "Rapports personnalisés" },
      ads: { name: "Publicités" }
    },
    comparison: {
      title: "Comparer les plans",
      description: "Choisissez le plan qui correspond à vos besoins",
      features: {
        scans: { name: "Scans", tooltip: "Nombre de scans de produits par mois" },
        unlimitedScans: { name: "Scans illimités", tooltip: "Scans de produits illimités" },
        basicInsights: { name: "Informations de base", tooltip: "Informations et évaluations de base sur les produits" },
        advancedAnalytics: { name: "Analyses avancées", tooltip: "Rapports détaillés sur la durabilité et la santé" },
        aiRecommendations: { name: "Recommandations IA", tooltip: "Recommandations de produits personnalisées" },
        prioritySupport: { name: "Support prioritaire", tooltip: "Support client plus rapide" },
        communityAccess: { name: "Accès communauté", tooltip: "Accès aux fonctionnalités de la communauté CORIA" },
        premiumCommunity: { name: "Communauté premium", tooltip: "Accès exclusif aux fonctionnalités de la communauté premium" },
        dataExport: { name: "Export de données", tooltip: "Exportez vos données de scan" },
        customReports: { name: "Rapports personnalisés", tooltip: "Créez des rapports de durabilité personnalisés" },
        ads: { name: "Publicités", tooltip: "Expérience sans publicité" }
      }
    },
    trial: {
      title: "Essai gratuit de 7 jours",
      description: "Essayez toutes les fonctionnalités premium gratuitement pendant 7 jours",
      noCard: "Aucune carte de crédit requise",
      startTrial: "Commencer l'essai"
    },
    faq: {
      title: "Questions fréquentes",
      cancel: {
        q: "Puis-je annuler à tout moment ?",
        a: "Oui, vous pouvez annuler votre abonnement à tout moment. Aucune question posée."
      },
      refund: {
        q: "Offrez-vous des remboursements ?",
        a: "Oui, nous offrons une garantie de remboursement de 30 jours pour tous les abonnements premium."
      },
      dataPrivacy: {
        q: "Comment protégez-vous mes données ?",
        a: "Nous utilisons un chiffrement standard de l'industrie et ne vendons jamais vos données à des tiers."
      },
      switchPlans: {
        q: "Puis-je changer de plan ?",
        a: "Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Nous calculons au prorata."
      }
    }
  },
  legal: {
    privacy: {
      title: "Politique de confidentialité",
      lastUpdated: "Dernière mise à jour",
      intro: "Cette politique de confidentialité décrit comment CORIA collecte, utilise et protège vos données personnelles.",
      sections: {
        dataCollection: {
          title: "Collecte de données",
          content: "Nous collectons les informations que vous nous fournissez lorsque vous utilisez CORIA, y compris :"
        },
        dataUsage: {
          title: "Utilisation des données",
          content: "Nous utilisons vos données pour :"
        },
        dataProtection: {
          title: "Protection des données",
          content: "Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles."
        },
        yourRights: {
          title: "Vos droits",
          content: "Vous avez le droit d'accéder, de corriger ou de supprimer vos données personnelles."
        },
        cookies: {
          title: "Cookies",
          content: "Nous utilisons des cookies pour améliorer votre expérience sur notre plateforme."
        },
        thirdParty: {
          title: "Services tiers",
          content: "Nous pouvons utiliser des services tiers qui ont leurs propres politiques de confidentialité."
        },
        contact: {
          title: "Contact",
          content: "Si vous avez des questions sur cette politique de confidentialité, veuillez nous contacter."
        }
      }
    }
  },
  contact: {
    form: {
      name: { label: "Nom", placeholder: "Votre nom complet" },
      email: { label: "E-mail", placeholder: "votre.email@exemple.fr" },
      subject: { label: "Sujet", placeholder: "Comment pouvons-nous vous aider ?" },
      message: { label: "Message", placeholder: "Dites-nous comment nous pouvons vous aider..." },
      submit: "Envoyer le message",
      sending: "Envoi en cours...",
      success: "Message envoyé avec succès !",
      error: "Erreur lors de l'envoi du message. Veuillez réessayer."
    },
    info: {
      title: "Informations de contact",
      email: "E-mail",
      phone: "Téléphone",
      address: "Adresse",
      followUs: "Suivez-nous"
    }
  }
};

const frPath = path.join(messagesDir, 'fr.json');
const frContent = JSON.parse(fs.readFileSync(frPath, 'utf8'));

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

deepMerge(frContent, frTranslations);

fs.writeFileSync(frPath, JSON.stringify(frContent, null, 2) + '\n', 'utf8');

console.log('✅ French translations added!');
console.log(`📊 File updated: ${frPath}`);
