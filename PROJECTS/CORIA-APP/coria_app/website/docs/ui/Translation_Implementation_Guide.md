# CORIA Translation Implementation Guide

**Purpose**: Step-by-step guide for adding, updating, and validating translations
**Audience**: Developers, translators, content managers
**Last Updated**: October 3, 2025

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding the Translation System](#understanding-the-translation-system)
3. [Adding New Translation Keys](#adding-new-translation-keys)
4. [Updating Existing Translations](#updating-existing-translations)
5. [Validating Translations](#validating-translations)
6. [Testing in UI](#testing-in-ui)
7. [Common Workflows](#common-workflows)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### For Developers Adding New Features

```bash
# 1. Add Turkish key (baseline)
# Edit: src/messages/tr.json
{
  "newFeature": {
    "title": "Yeni Özellik",
    "description": "Bu harika bir özelliktir"
  }
}

# 2. Run extraction to identify missing translations
npm run i18n:extract

# 3. Review reports
open docs/ui/reports/translation-gaps-de-*.md

# 4. Add to other locales or mark for translation
# Edit: src/messages/en.json, de.json, fr.json

# 5. Validate
npm run i18n:validate

# 6. Test in UI
npm run dev
```

### For Translators Completing Gaps

```bash
# 1. Get latest translation gaps
npm run i18n:extract

# 2. Review translator task brief
open docs/ui/Translation_Task_DE.md

# 3. Complete translations in de.json or fr.json

# 4. Validate your work
npm run i18n:validate --locale=de

# 5. Submit for review
```

---

## 🧩 Understanding the Translation System

### Architecture

CORIA uses **Next.js Internationalization (i18n)** with JSON-based translation files:

```
website/
├── src/
│   ├── messages/           # Translation files
│   │   ├── tr.json        # Turkish (baseline)
│   │   ├── en.json        # English
│   │   ├── de.json        # German
│   │   └── fr.json        # French
│   ├── i18n/
│   │   └── config.ts      # i18n configuration
│   └── middleware.ts      # Locale routing
├── scripts/
│   ├── extract-missing-translations.js
│   └── validate-translations.js
└── docs/ui/
    ├── Translation_Task_*.md
    └── reports/
