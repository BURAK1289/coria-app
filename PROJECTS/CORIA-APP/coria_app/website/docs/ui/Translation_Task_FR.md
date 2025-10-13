# French (FR) Translation Task Document

## Executive Summary

**Current State**: 303/595 keys translated (50.9% complete)
**Missing Keys**: 292 translations required
**Source Files**: TR (Turkish baseline) + EN (English reference)
**Target File**: `website/src/messages/fr.json`

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
| English | French (FR) | Notes |
|---------|-------------|-------|
| Vegan | Végane / Végan | "Végane" preferred in France |
| Sustainability | Durabilité | Key concept |
| Impact | Impact | Same in French |
| Scanner | Scanner | Adopted term |
| Dashboard | Tableau de bord | French equivalent |
| Community | Communauté | For social features |
| Premium | Premium | Keep English |
| Barcode | Code-barres | Standard term |
| AI Recommendations | Recommandations IA | IA = Intelligence Artificielle |
| Carbon Footprint | Empreinte carbone | Standard term |
| Privacy Policy | Politique de confidentialité | Legal standard |
| GDPR | RGPD | French acronym (Règlement Général sur la Protection des Données) |
| Terms of Service | Conditions d'utilisation | Legal standard |

### Action Verbs (Formal "Vous" Form)
| English | French (FR) |
|---------|-------------|
| Scan | Scannez |
| Discover | Découvrez |
| Track | Suivez |
| Join | Rejoignez-nous |
| Download | Télécharger |
| Learn More | En savoir plus |
| Get Started | Commencer |
| Contact Us | Contactez-nous |

---

## Tone & Style Guidelines

### Formality Level
- **Use "vous" form** throughout (formal address)
- Professional yet warm tone
- Action-oriented language for CTAs
- Clarity over creativity for technical terms

### French-Specific Considerations
- **Accent Marks**: Essential for proper French (é, è, ê, à, ù, ç)
- **Gender Agreement**: Match adjectives to nouns
  - Example: "application mobile" (feminine), "produit durable" (masculine)
- **Liaison**: Consider natural French flow
- **Contractions**: Use appropriate contractions (l', d', qu', etc.)
- **Spacing**: Space before punctuation (!, ?, ;, :)
  - Example: "Bienvenue !" not "Bienvenue!"

### Marketing Copy Adaptation
- Headlines: Maintain elegance while preserving impact
- CTAs: Direct imperatives with "vous" form
- Descriptions: Natural French syntax (can differ significantly from English)

---

## Length Constraints

| Element Type | Max Characters | Notes |
|--------------|----------------|-------|
| Button Text | 25 chars | French tends longer than English |
| Navigation Items | 18 chars | Account for accents |
| Feature Titles | 70 chars | French can be 15-20% longer |
| Feature Descriptions | 180 chars | Natural French phrasing |
| Hero Headlines | 90 chars | Maintain elegance |
| Meta Descriptions | 160 chars | SEO optimization |
| Error Messages | 120 chars | Clear, polite tone |

**Note**: French text averages 15-20% longer than English - monitor character limits carefully.

---

## Phased Implementation Approach

### Phase 1: Critical UI (6-8 hours)
**Priority**: High-visibility, user-facing elements
- Navigation & common UI elements
- Hero section & main CTAs
- Core feature titles
- Error messages & validation

**Validation**: UI smoke test in French locale

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

**Validation**: Legal review for RGPD compliance

---

## Quality Checklist

### Pre-Translation
- [ ] Review complete glossary
- [ ] Understand brand tone guidelines
- [ ] Check existing French translations for consistency
- [ ] Verify technical term conventions

### During Translation
- [ ] Use formal "vous" form consistently
- [ ] Apply correct accent marks
- [ ] Match gender agreement (adjectives/nouns)
- [ ] Maintain character length constraints
- [ ] Preserve placeholders ({{variable}}, %s, etc.)
- [ ] Add spacing before punctuation (!, ?, ;, :)

### Post-Translation
- [ ] Spell check (French dictionary)
- [ ] Grammar validation
- [ ] Consistency check against glossary
- [ ] Character length validation
- [ ] JSON syntax validation
- [ ] Test in UI for natural flow
- [ ] Verify accent marks rendered correctly

---

## Delivery Format

### JSON Patch Structure
Translations will be applied using this structure:

```json
{
  "locale": "fr",
  "translations": [
    {
      "key": "navigation.foundation",
      "value": "Fondation"
    },
    {
      "key": "features.barcodeScan.title",
      "value": "Scanner de code-barres"
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

Expected output: `FR: 595/595 keys (100%)`

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
- `docs/ui/I18N_Translation_Missing_FR.json` (292 keys)

Each entry includes:
- **key**: Dot-notation path (e.g., "navigation.foundation")
- **tr**: Turkish baseline value
- **en**: English reference value

---

## Implementation Notes

### Special Cases

1. **KVKK → RGPD**: Turkish data protection law becomes GDPR in French
   - "KVKK Aydınlatma Metni" → "Notice RGPD"

2. **Currency**: Keep € symbol, adapt formatting
   - English: "€10/month" → French: "10 €/mois"
   - Note: Space before € symbol in France, no space in Canada

3. **Dates**: Use French format
   - English: "MM/DD/YYYY" → French: "DD/MM/YYYY"

4. **Numbers**: Use French decimal separator
   - English: "1,000.50" → French: "1 000,50" (space for thousands)

5. **Punctuation Spacing**: Essential French typography rule
   - "Bienvenue !" (with space before !)
   - "Pourquoi ? Parce que..." (with space before ?)
   - "Note : important" (with space before :)

### Testing Strategy

1. **Visual Testing**: Check UI in all viewports (mobile, tablet, desktop)
2. **Typography Testing**: Verify accent marks, spacing, special characters
3. **Functional Testing**: Verify form validation messages
4. **SEO Testing**: Validate meta descriptions, titles
5. **Accessibility Testing**: Screen reader compatibility (NVDA/JAWS)

---

## French Regional Variations

### France vs. Canada Considerations
- **Vegan**: "végane" (France) vs. "végan" (Canada)
- **Currency**: "10 €" (France) vs. "10$" (Canada)
- **Email**: "courriel" (Canada) vs. "email" (France)
- **Download**: "télécharger" (universal)

**Recommendation**: Use France French as primary, note Canadian alternatives in glossary if targeting both markets.

---

**Task Status**: Ready for professional translation assignment
**Next Step**: Apply translations using patch file + validation
**Contact**: Technical team for glossary clarifications or context questions
