# Pricing i18n Translation Guide

**Status:** TR Complete (300+ keys) | EN/DE/FR Pending Translation
**Priority:** High - Required for international launch
**Estimated Effort:** 2-3 hours per language with professional translator

## Translation Requirements

### Source Language
- **Turkish (tr.json):** ✅ Complete with 300+ pricing keys
- Located at: `website/src/messages/tr.json` (lines 798-1139)

### Target Languages
- **English (en.json):** ⏳ Pending
- **German (de.json):** ⏳ Pending
- **French (fr.json):** ⏳ Pending

## Translation Scope

### Pricing Namespace Structure

```
pricing.{
  title, subtitle, tagline
  meta.{title, description}
  trial.{duration, noCard, afterTrial, description}
  plans.{free, premium}.{name, description, highlights[], cta}
  billingPeriods.{monthly, yearly, family, lifetime}
  regional.{
    title, subtitle, vatIncluded, discount, perMonth, perYear, oneTime
    regions.{US, EU, TR}.{name, currency, monthly, yearly, family, lifetime}
    note
  }
  features.{
    title, subtitle
    scanningAndNutrition.{name, free, premium, note}
    sustainabilityMetrics.{name, free, premium, note}
    alternativesAndRecipes.{name, free, premium, note, tooltip}
    smartPantry.{name, free, premium, note, tooltip}
    shoppingList.{name, free, premium, note}
    aiChat.{name, free, premium, note, tooltip}
    mealPlanner.{name, free, premium, note, tooltip}
    scanHistory.{name, free, premium, note}
    weeklySummary.{name, free, premium, note}
    notifications.{name, free, premium, note}
    ads.{name, free, premium, note}
  }
  paywallTriggers.{
    alternatives.{title, description, cta}
    recipes.{title, description, cta}
    aiLimit.{title, description, cta}
    pantryLimit.{title, description, cta}
    mealPlanner.{title, description, cta}
  }
  upgradeReasons.{
    title
    reasons[].{title, description, icon}
  }
  comparison.{title, free, premium, available, notAvailable, limited, unlimited}
  trust.{
    title
    benefits[].{title, description, icon}
  }
  faq.{
    title
    questions[].{question, answer}
  }
  testimonials.{
    title
    reviews[].{name, location, rating, text, feature}
  }
  cta.{title, description, startTrial, downloadIos, downloadAndroid, note}
  support.{
    title, description
    methods[].{title, description, contact, icon}
  }
}
```

## Key Translation Glossary

### Core Terms
| Turkish | English | German | French |
|---------|---------|--------|--------|
| Fiyatlandırma | Pricing | Preise | Tarifs |
| Free | Free | Kostenlos | Gratuit |
| Premium | Premium | Premium | Premium |
| Sınırsız | Unlimited | Unbegrenzt | Illimité |
| Temel | Basic | Einfach | Basique |

### Features
| Turkish | English | German | French |
|---------|---------|--------|--------|
| Tarama | Scanning | Scannen | Scan |
| Akıllı Kiler | Smart Pantry | Intelligenter Vorrat | Garde-manger intelligent |
| Yemek Planlayıcı | Meal Planner | Essensplaner | Planificateur de repas |
| Alternatifler | Alternatives | Alternativen | Alternatives |
| Tarifler | Recipes | Rezepte | Recettes |

### Billing & Pricing
| Turkish | English | German | French |
|---------|---------|--------|--------|
| Aylık | Monthly | Monatlich | Mensuel |
| Yıllık | Yearly | Jährlich | Annuel |
| Aile Planı | Family Plan | Familienplan | Plan Famille |
| Lifetime | Lifetime | Lebenslang | À vie |
| KDV dahil | VAT included | MwSt. inbegriffen | TVA incluse |

## Translation Guidelines

### 1. Maintain Brand Voice
- Keep "CORIA" and "Premium" untranslated
- Preserve emoji usage in icons
- Maintain tone: professional, eco-conscious, empowering

### 2. Technical Accuracy
- Preserve all pricing values exactly ($5.49, €4.99, ₺89.99)
- Keep feature counts accurate (10 messages/day, 20 products, etc.)
- Maintain technical terms (AI, API, etc.)

### 3. Cultural Adaptation
- Adjust examples for regional context
- Use appropriate formal/informal address
- Consider local privacy/data regulations

### 4. String Formatting
- Preserve placeholders: `{percent}%`, `{count}`
- Maintain line breaks and formatting
- Keep HTML/Markdown if present

## Translation Process

### Step 1: Extract Source (Turkish)
```bash
# Already completed - tr.json has full pricing namespace
cd website
python scripts/extract-pricing-keys.py
```

### Step 2: Professional Translation
**Recommended Services:**
- Lokalise (supports JSON, has glossary)
- Crowdin (good for app localization)
- Professional translator familiar with:
  - SaaS/subscription terminology
  - Sustainability/eco vocabulary
  - Mobile app UX writing

### Step 3: Import Translations
```bash
# After receiving professional translations
node scripts/import-translations.js --lang en --file translations-en.json
node scripts/import-translations.js --lang de --file translations-de.json
node scripts/import-translations.js --lang fr --file translations-fr.json
```

### Step 4: Validation
```bash
# Check for missing keys
npm run i18n:validate

# Expected output:
# ✅ TR: 0 missing keys (100% coverage)
# ✅ EN: 0 missing keys (100% coverage)
# ✅ DE: 0 missing keys (100% coverage)
# ✅ FR: 0 missing keys (100% coverage)
```

## Priority Translation Order

### Phase 1: Critical (MVP Launch)
1. **English (en.json)** - International default
   - Effort: 2-3 hours
   - Priority: Highest

### Phase 2: European Markets
2. **German (de.json)** - DACH region
   - Effort: 2-3 hours
   - Priority: High

3. **French (fr.json)** - France, Belgium, Switzerland
   - Effort: 2-3 hours
   - Priority: High

## Quality Assurance

### Translation Checklist
- [ ] All 300+ keys translated
- [ ] Glossary terms consistent
- [ ] Pricing values preserved
- [ ] Feature counts accurate
- [ ] CTAs clear and actionable
- [ ] No placeholder text (Lorem ipsum, TODO, etc.)
- [ ] Character length appropriate for UI
- [ ] Grammar and spelling correct
- [ ] Native speaker review completed

### Testing Checklist
- [ ] Visual QA in each language
- [ ] Text overflow/truncation check
- [ ] Currency formatting correct
- [ ] Date/number formatting localized
- [ ] Links and CTAs functional
- [ ] Screen reader accessible

## Budget Estimation

### Translation Costs (Approximate)
- **Word count:** ~3,000 words per language
- **Professional rate:** $0.10-0.20/word
- **Total per language:** $300-600 USD
- **All 3 languages:** $900-1,800 USD

### DIY with Translation Service
- **Lokalise:** ~$100/month (includes AI assist)
- **DeepL Pro:** ~$25/month (machine translation)
- **Manual review:** 4-6 hours (in-house)

## Current Status

```
Pricing i18n Coverage:
├─ Turkish (tr.json)     ✅ 100% (300+ keys)
├─ English (en.json)     ⏳ 0% (needs professional translation)
├─ German (de.json)      ⏳ 0% (needs professional translation)
└─ French (fr.json)      ⏳ 0% (needs professional translation)

Total Completion: 25% (1/4 languages)
```

## Next Steps

1. **Immediate (Week 1)**
   - [ ] Budget approval for professional translation
   - [ ] Select translation service/translator
   - [ ] Export Turkish pricing keys for translation

2. **Short-term (Week 2-3)**
   - [ ] Receive EN translations
   - [ ] Import and validate EN
   - [ ] Begin DE/FR translations

3. **Complete (Week 4)**
   - [ ] Import DE/FR translations
   - [ ] Complete i18n validation
   - [ ] QA testing all languages
   - [ ] Deploy with full i18n support

## Contact for Translation

**Internal Review:** Product team, native speakers
**External Services:**
- Lokalise: https://lokalise.com
- Crowdin: https://crowdin.com
- Gengo: https://gengo.com (on-demand professional)

---

**Last Updated:** 2025-10-13
**Document Owner:** i18n Team
**Status:** Awaiting translation budget approval
