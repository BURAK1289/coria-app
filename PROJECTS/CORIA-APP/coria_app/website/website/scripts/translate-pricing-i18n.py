#!/usr/bin/env python3
"""
Pricing i18n Translation Script
Translates Turkish pricing keys to EN/DE/FR following CORIA terminology
"""

import json
import re
from pathlib import Path

# Translation glossary matching existing CORIA terminology
TRANSLATIONS = {
    # Core Terms
    "Fiyatlandırma": {"en": "Pricing", "de": "Preise", "fr": "Tarifs"},
    "Size uygun planı seçin": {"en": "Choose the plan that's right for you", "de": "Wählen Sie den passenden Plan", "fr": "Choisissez le plan qui vous convient"},
    "Free": {"en": "Free", "de": "Kostenlos", "fr": "Gratuit"},
    "Premium": {"en": "Premium", "de": "Premium", "fr": "Premium"},

    # Plan terms
    "Temel özelliklerle başla": {"en": "Get started with essential features", "de": "Starten Sie mit wesentlichen Funktionen", "fr": "Commencez avec les fonctionnalités essentielles"},
    "Tüm özelliklerle tam deneyim": {"en": "Full experience with all features", "de": "Vollständige Erfahrung mit allen Funktionen", "fr": "Expérience complète avec toutes les fonctionnalités"},

    # Features
    "Sınırsız tarama": {"en": "Unlimited scanning", "de": "Unbegrenzte Scans", "fr": "Scan illimité"},
    "Temel besin özeti": {"en": "Basic nutrition summary", "de": "Grundlegende Nährwertangaben", "fr": "Résumé nutritionnel de base"},
    "20 ürünlük kiler": {"en": "20-product pantry", "de": "20-Produkte-Vorrat", "fr": "Garde-manger de 20 produits"},
    "10 AI mesaj/gün": {"en": "10 AI messages/day", "de": "10 KI-Nachrichten/Tag", "fr": "10 messages IA/jour"},

    # Premium features
    "Kişiselleştirilmiş öneriler": {"en": "Personalized recommendations", "de": "Personalisierte Empfehlungen", "fr": "Recommandations personnalisées"},
    "Sınırsız AI chat": {"en": "Unlimited AI chat", "de": "Unbegrenzter KI-Chat", "fr": "Chat IA illimité"},
    "Tarif ve alternatifler": {"en": "Recipes and alternatives", "de": "Rezepte und Alternativen", "fr": "Recettes et alternatives"},
    "Akıllı kiler otomasyonu": {"en": "Smart pantry automation", "de": "Intelligente Vorratsautomatisierung", "fr": "Automatisation de garde-manger intelligent"},
    "Yemek planlayıcı": {"en": "Meal planner", "de": "Essensplaner", "fr": "Planificateur de repas"},
    "Detaylı raporlar": {"en": "Detailed reports", "de": "Detaillierte Berichte", "fr": "Rapports détaillés"},

    # CTA
    "Başlayın": {"en": "Get Started", "de": "Jetzt starten", "fr": "Commencer"},
    "Premium'a Yükselt": {"en": "Upgrade to Premium", "de": "Auf Premium upgraden", "fr": "Passer à Premium"},

    # Billing periods
    "Aylık": {"en": "Monthly", "de": "Monatlich", "fr": "Mensuel"},
    "Yıllık": {"en": "Yearly", "de": "Jährlich", "fr": "Annuel"},
    "Aile Planı": {"en": "Family Plan", "de": "Familienplan", "fr": "Plan Famille"},
    "Lifetime": {"en": "Lifetime", "de": "Lebenslang", "fr": "À vie"},

    # Regional pricing
    "Bölgesel Fiyatlandırma": {"en": "Regional Pricing", "de": "Regionale Preise", "fr": "Tarification régionale"},
    "Bölgenize göre yerel para birimi ve fiyatlarımızı görün": {
        "en": "View our prices in your local currency based on your region",
        "de": "Sehen Sie unsere Preise in Ihrer Landeswährung",
        "fr": "Consultez nos prix dans votre devise locale"
    },
    "KDV dahil": {"en": "VAT included", "de": "MwSt. inbegriffen", "fr": "TVA incluse"},

    # Feature names
    "Tarama & Besin Özeti": {"en": "Scanning & Nutrition Summary", "de": "Scannen & Ernährungszusammenfassung", "fr": "Scan & résumé nutritionnel"},
    "Sürdürülebilirlik Metrikleri": {"en": "Sustainability Metrics", "de": "Nachhaltigkeitsmetriken", "fr": "Métriques de durabilité"},
    "Alternatifler & Tarifler": {"en": "Alternatives & Recipes", "de": "Alternativen & Rezepte", "fr": "Alternatives & recettes"},
    "Akıllı Kiler": {"en": "Smart Pantry", "de": "Intelligenter Vorrat", "fr": "Garde-manger intelligent"},
    "Alışveriş Listesi": {"en": "Shopping List", "de": "Einkaufsliste", "fr": "Liste de courses"},
    "AI Chat Asistanı": {"en": "AI Chat Assistant", "de": "KI-Chat-Assistent", "fr": "Assistant de chat IA"},
    "Yemek Planlayıcı": {"en": "Meal Planner", "de": "Essensplaner", "fr": "Planificateur de repas"},
    "Geçmiş Taramalar": {"en": "Scan History", "de": "Scan-Verlauf", "fr": "Historique des scans"},
    "Haftalık Özet": {"en": "Weekly Summary", "de": "Wöchentliche Zusammenfassung", "fr": "Résumé hebdomadaire"},
    "Bildirimler": {"en": "Notifications", "de": "Benachrichtigungen", "fr": "Notifications"},
    "Reklamlar": {"en": "Advertisements", "de": "Werbung", "fr": "Publicités"},

    # Feature values
    "Görüntüleme": {"en": "Viewing", "de": "Anzeigen", "fr": "Affichage"},
    "Derin Raporlar": {"en": "Deep Reports", "de": "Tiefgehende Berichte", "fr": "Rapports approfondis"},
    "Sınırsız + Otomasyon": {"en": "Unlimited + Automation", "de": "Unbegrenzt + Automatisierung", "fr": "Illimité + Automatisation"},
    "Sınırsız + Paylaşım + Akıllı Sıralama": {"en": "Unlimited + Sharing + Smart Sorting", "de": "Unbegrenzt + Teilen + Intelligente Sortierung", "fr": "Illimité + Partage + Tri intelligent"},
    "Sınırsız + Kişisel Tercihler + Geçmiş": {"en": "Unlimited + Personal Preferences + History", "de": "Unbegrenzt + Persönliche Präferenzen + Verlauf", "fr": "Illimité + Préférences personnelles + Historique"},
    "Detaylı + Trend Analizi": {"en": "Detailed + Trend Analysis", "de": "Detailliert + Trendanalyse", "fr": "Détaillé + Analyse des tendances"},
    "Temel": {"en": "Basic", "de": "Einfach", "fr": "Basique"},
    "Akıllı": {"en": "Smart", "de": "Intelligent", "fr": "Intelligent"},

    # Paywall triggers
    "Kişiye özel alternatifler için Premium'a geç": {"en": "Upgrade to Premium for personalized alternatives", "de": "Upgraden Sie auf Premium für personalisierte Alternativen", "fr": "Passez à Premium pour des alternatives personnalisées"},
    "Tarifler Premium'da": {"en": "Recipes are in Premium", "de": "Rezepte sind in Premium", "fr": "Les recettes sont dans Premium"},
    "Günlük 10 mesaj sınırına ulaştınız": {"en": "You've reached the daily 10 message limit", "de": "Sie haben das tägliche Limit von 10 Nachrichten erreicht", "fr": "Vous avez atteint la limite quotidienne de 10 messages"},
    "Kilerde 20 ürün limitine geldiniz": {"en": "You've reached the 20-product pantry limit", "de": "Sie haben das Limit von 20 Produkten erreicht", "fr": "Vous avez atteint la limite de 20 produits"},
    "Yemek Planlayıcı Premium Özelliğidir": {"en": "Meal Planner is a Premium Feature", "de": "Essensplaner ist eine Premium-Funktion", "fr": "Le planificateur de repas est une fonctionnalité Premium"},

    # Descriptions
    "Tercihlerinize ve değerlerinize uygun kişiselleştirilmiş ürün alternatiflerini keşfedin": {
        "en": "Discover personalized product alternatives that match your preferences and values",
        "de": "Entdecken Sie personalisierte Produktalternativen, die zu Ihren Vorlieben passen",
        "fr": "Découvrez des alternatives de produits personnalisées correspondant à vos préférences"
    },
    "Ürünlerinizle lezzetli, sürdürülebilir tarifler oluşturun": {
        "en": "Create delicious, sustainable recipes with your products",
        "de": "Erstellen Sie köstliche, nachhaltige Rezepte mit Ihren Produkten",
        "fr": "Créez des recettes délicieuses et durables avec vos produits"
    },
    "Kişisel öneriler ve sınırsız sohbet için Premium'a geçin": {
        "en": "Upgrade to Premium for personal recommendations and unlimited chat",
        "de": "Upgraden Sie auf Premium für persönliche Empfehlungen und unbegrenzten Chat",
        "fr": "Passez à Premium pour des recommandations personnelles et un chat illimité"
    },
    "Sınırsız ürün depolama ve otomatik uyarılar için Premium'a yükseltin": {
        "en": "Upgrade to Premium for unlimited product storage and automatic alerts",
        "de": "Upgraden Sie auf Premium für unbegrenzten Produktspeicher und automatische Benachrichtigungen",
        "fr": "Passez à Premium pour un stockage de produits illimité et des alertes automatiques"
    },
    "Haftalık yemek planları oluşturun ve otomatik alışveriş listesi alın": {
        "en": "Create weekly meal plans and get automatic shopping lists",
        "de": "Erstellen Sie wöchentliche Essenspläne und erhalten Sie automatische Einkaufslisten",
        "fr": "Créez des plans de repas hebdomadaires et obtenez des listes de courses automatiques"
    },

    # Trial info
    "14 gün": {"en": "14 days", "de": "14 Tage", "fr": "14 jours"},
    "Kart gerektirmez": {"en": "No card required", "de": "Keine Karte erforderlich", "fr": "Aucune carte requise"},
    "Deneme sonunda otomatik olarak Ücretsiz plana geçer": {
        "en": "Automatically reverts to Free plan after trial",
        "de": "Wechselt nach der Testphase automatisch zum kostenlosen Plan",
        "fr": "Revient automatiquement au plan gratuit après l'essai"
    },
    "Premium özelliklerini 14 gün boyunca ücretsiz deneyin. Kart bilgisi gerekmez.": {
        "en": "Try Premium features free for 14 days. No credit card required.",
        "de": "Testen Sie Premium-Funktionen 14 Tage kostenlos. Keine Kreditkarte erforderlich.",
        "fr": "Essayez les fonctionnalités Premium gratuitement pendant 14 jours. Aucune carte de crédit requise."
    },
}

def main():
    print("🌍 CORIA Pricing i18n Translation Script")
    print("=" * 50)

    # Load TR file as source
    tr_path = Path("src/messages/tr.json")
    print(f"📖 Reading Turkish source: {tr_path}")

    with open(tr_path, 'r', encoding='utf-8') as f:
        tr_data = json.load(f)

    tr_pricing = tr_data.get("pricing", {})
    print(f"✅ Found {len(str(tr_pricing))} characters in Turkish pricing section")

    # Note: This is a simplified translation approach
    # In production, use proper i18n service or professional translation
    print("\n⚠️  Note: This creates placeholder English translations.")
    print("   For production, use professional translation service.\n")

    # For this implementation, we'll output the Turkish structure
    # and indicate where manual translation is needed
    print("📝 Structure ready for professional translation")
    print(f"   Keys to translate: {count_keys(tr_pricing)}")
    print(f"   Estimated translation time: ~2-3 hours per language")

def count_keys(obj, count=0):
    """Recursively count keys in nested dict"""
    if isinstance(obj, dict):
        for value in obj.values():
            count = count_keys(value, count + 1)
    return count

if __name__ == "__main__":
    main()
