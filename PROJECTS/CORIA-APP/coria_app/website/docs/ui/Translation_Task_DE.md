# German (DE) Translation Task Document

## Executive Summary

**Current State**: 303/595 keys translated (50.9% complete)
**Missing Keys**: 292 translations required
**Source Files**: TR (Turkish baseline) + EN (English reference)
**Target File**: `website/src/messages/de.json`

---

## Translation Breakdown by Namespace

### Navigation & Structure (28 keys)
- `navigation.*` - Main navigation items, footer links
- `common.*` - Buttons, actions, labels
- **Estimated Effort**: 2-3 hours

### Hero & Marketing (45 keys)
- `hero.*` - Main headlines, CTAs, taglines
- `sections.*` - Homepage sections, testimonials
- **Estimated Effort**: 3-4 hours

### Features & Product (89 keys)
- `features.*` - Feature titles, descriptions, benefits
- `scanner.*` - Product scanning interface
- **Estimated Effort**: 6-8 hours

### Legal & Footer (58 keys)
- `footer.*` - Company info, social links
- `legal.*` - Privacy policy, terms, GDPR notices
- **Estimated Effort**: 4-5 hours

### Forms & UI (72 keys)
- `contact.*` - Contact form fields, validation
- `errors.*` - Error messages, warnings
- `loading.*` - Loading states, progress indicators
- **Estimated Effort**: 5-6 hours

---

## Critical Translation Glossary

### Brand & Product Terms (Keep Unchanged)
- CORIA → **CORIA** (brand name)
- Foundation → **Foundation** (proper noun in context)
- Token → **Token** (technical term)
- ESG → **ESG** (international standard)

### Core Concepts
| English | German (DE) | Notes |
|---------|-------------|-------|
| Vegan | Vegan | Same in German |
| Sustainability | Nachhaltigkeit | Key concept |
| Impact | Wirkung / Einfluss | Context dependent |
| Scanner | Scanner | Adopted term |
| Dashboard | Dashboard | Technical term |
| Community | Gemeinschaft | For social features |
| Premium | Premium | Keep English |
| Barcode | Barcode / Strichcode | Barcode preferred |
| AI Recommendations | KI-Empfehlungen | KI = Künstliche Intelligenz |
| Carbon Footprint | CO₂-Fußabdruck | Standard term |
| Privacy Policy | Datenschutzrichtlinie | Legal standard |
| GDPR | DSGVO | German acronym |
| Terms of Service | Nutzungsbedingungen | Legal standard |

### Action Verbs (Formal "Sie" Form)
| English | German (DE) |
|---------|-------------|
| Scan | Scannen Sie |
| Discover | Entdecken Sie |
| Track | Verfolgen Sie |
| Join | Werden Sie Mitglied |
| Download | Herunterladen |
| Learn More | Mehr erfahren |
| Get Started | Jetzt starten |
| Contact Us | Kontaktieren Sie uns |

---

## Tone & Style Guidelines

### Formality Level
- **Use "Sie" form** throughout (formal address)
- Professional yet approachable tone
- Action-oriented language for CTAs
- Clarity over cleverness for technical terms

### German-Specific Considerations
- **Compound Words**: Leverage German's compound word structure
  - Example: "Nachhaltigkeitsbewertung" (sustainability rating)
- **Sentence Structure**: Adapt to natural German word order
- **Article Usage**: Include definite/indefinite articles where natural
- **Gender-Neutral Language**: Use inclusive forms where applicable
  - Example: "Nutzer:innen" or "Nutzende" instead of "Nutzer"

### Marketing Copy Adaptation
- Headlines: Maintain impact while preserving German flow
- CTAs: Direct, action-oriented imperatives
- Descriptions: Concise but complete (German can be wordier)

---

## Length Constraints

| Element Type | Max Characters | Notes |
|--------------|----------------|-------|
| Button Text | 20 chars | Short imperative verbs |
| Navigation Items | 15 chars | Single words preferred |
| Feature Titles | 60 chars | Can use compound words |
| Feature Descriptions | 150 chars | 1-2 sentences max |
| Hero Headlines | 80 chars | Maintain impact |
| Meta Descriptions | 160 chars | SEO optimization |
| Error Messages | 100 chars | Clear, actionable |

**Note**: German text averages 10-30% longer than English - monitor character limits carefully.

---

## Phased Implementation Approach

### Phase 1: Critical UI (6-8 hours)
**Priority**: High-visibility, user-facing elements
- Navigation & common UI elements
- Hero section & main CTAs
- Core feature titles
- Error messages & validation

**Validation**: UI smoke test in German locale

### Phase 2: Content & Marketing (8-10 hours)
**Priority**: Marketing content, feature descriptions
- Complete feature descriptions
- Section content (testimonials, benefits)
- Footer & company information
- Blog/content metadata

**Validation**: Content review for tone consistency

### Phase 3: Legal & Edge Cases (5-7 hours)
**Priority**: Legal compliance, edge cases
- Privacy policy, terms, GDPR notices
- Accessibility labels
- Loading states, tooltips
- Edge case error messages

**Validation**: Legal review for DSGVO compliance

---

## Quality Checklist

### Pre-Translation
- [ ] Review complete glossary
- [ ] Understand brand tone guidelines
- [ ] Check existing German translations for consistency
- [ ] Verify technical term conventions

### During Translation
- [ ] Use formal "Sie" form consistently
- [ ] Apply compound words where natural
- [ ] Maintain character length constraints
- [ ] Preserve placeholders ({{variable}}, %s, etc.)
- [ ] Check gender-neutral language usage

### Post-Translation
- [ ] Spell check (German dictionary)
- [ ] Grammar validation
- [ ] Consistency check against glossary
- [ ] Character length validation
- [ ] JSON syntax validation
- [ ] Test in UI for natural flow

---

## Delivery Format

### JSON Patch Structure
Translations will be applied using this structure:

```json
{
  "locale": "de",
  "translations": [
    {
      "key": "navigation.foundation",
      "value": "Stiftung"
    },
    {
      "key": "features.barcodeScan.title",
      "value": "Barcode-Scannen"
    }
  ]
}
```

### Validation Command
After applying translations:
```bash
cd website
npm run i18n:validate
```

Expected output: `DE: 595/595 keys (100%)`

---

## Effort Estimates

### Time Breakdown
- **Phase 1 (Critical UI)**: 6-8 hours
- **Phase 2 (Content)**: 8-10 hours
- **Phase 3 (Legal)**: 5-7 hours
- **QA & Validation**: 2-3 hours
- **Total**: 21-28 hours

### Cost Estimate (Professional Translation)
- **Rate**: €50-70/hour (professional technical translator)
- **Total**: €1,050-1,960
- **Timeline**: 3-5 business days

### Alternative: Machine Translation + Review
- **Machine Translation**: 1-2 hours (GPT-4)
- **Human Review & Editing**: 8-12 hours
- **Total**: €400-840
- **Timeline**: 2-3 business days

---

## Source Data Reference

Complete source data with TR/EN references available in:
- `docs/ui/I18N_Translation_Missing_DE.json` (292 keys)

Each entry includes:
- **key**: Dot-notation path (e.g., "navigation.foundation")
- **tr**: Turkish baseline value
- **en**: English reference value

---

## Implementation Notes

### Special Cases

1. **KVKK → DSGVO**: Turkish data protection law becomes GDPR in German
   - "KVKK Aydınlatma Metni" → "DSGVO-Hinweis"

2. **Currency**: Keep € symbol, adapt formatting
   - English: "€10/month" → German: "10 €/Monat"

3. **Dates**: Use German format
   - English: "MM/DD/YYYY" → German: "DD.MM.YYYY"

4. **Numbers**: Use German decimal separator
   - English: "1,000.50" → German: "1.000,50"

### Testing Strategy

1. **Visual Testing**: Check UI in all viewports (mobile, tablet, desktop)
2. **Functional Testing**: Verify form validation messages
3. **SEO Testing**: Validate meta descriptions, titles
4. **Accessibility Testing**: Screen reader compatibility (JAWS/NVDA)

---

**Task Status**: Ready for professional translation assignment
**Next Step**: Apply translations using patch file + validation
**Contact**: Technical team for glossary clarifications or context questions
