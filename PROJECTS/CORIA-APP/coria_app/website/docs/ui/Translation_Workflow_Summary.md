# CORIA Translation Workflow - Executive Summary

**Created**: October 3, 2025
**Purpose**: Quick reference for German/French translation gap closure
**Status**: Ready for execution

---

## 📊 Current Status

| Locale | Current Coverage | Missing Keys | Estimated Effort |
|--------|------------------|--------------|------------------|
| **German (DE)** | 306/589 (51.9%) | 288 keys | 8-12 hours |
| **French (FR)** | 306/589 (51.9%) | 288 keys | 8-12 hours |
| **Total** | - | 576 keys | 16-24 hours |

---

## 🚀 Quick Start

### For Project Manager / Coordinator

```bash
# 1. Generate translator briefs (already done)
cd website
npm run i18n:extract

# 2. Review generated briefs
open docs/ui/Translation_Task_DE.md
open docs/ui/Translation_Task_FR.md

# 3. Contract translators
# - Send Translation_Task_DE.md to German translator
# - Send Translation_Task_FR.md to French translator
# - Budget: ~$150-200 per language
# - Timeline: 2-3 business days

# 4. After receiving translations
npm run i18n:validate --locale=de
npm run i18n:validate --locale=fr

# 5. QA and integration
# See Translation_QA_Workflow.md for complete process
```

---

## 📁 Generated Documentation

### For Translators
| Document | Purpose | Location |
|----------|---------|----------|
| **Translation_Task_DE.md** | German translation brief with all 288 missing keys | `docs/ui/Translation_Task_DE.md` |
| **Translation_Task_FR.md** | French translation brief with all 288 missing keys | `docs/ui/Translation_Task_FR.md` |

### For QA Team
| Document | Purpose | Location |
|----------|---------|----------|
| **Translation_QA_Workflow.md** | Complete QA validation process | `docs/ui/Translation_QA_Workflow.md` |
| **Translation gaps report (DE)** | Detailed missing keys breakdown | `reports/translation-gaps-de-*.md` |
| **Translation gaps report (FR)** | Detailed missing keys breakdown | `reports/translation-gaps-fr-*.md` |

### For Developers
| Document | Purpose | Location |
|----------|---------|----------|
| **Translation_Implementation_Guide.md** | How to add/update translations | `docs/ui/Translation_Implementation_Guide.md` |
| **UI_Remediation_Plan.md** | Updated Sprint 1 tasks | `docs/ui/UI_Remediation_Plan.md` |

---

## 🛠️ Automation Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| **extract-missing-translations.js** | Generate translator briefs | `npm run i18n:extract` |
| **validate-translations.js** | Validate structure & completeness | `npm run i18n:validate` |

---

## ✅ Translation Workflow (6 Phases)

### Phase 1: Automated Extraction ✅ COMPLETE
```bash
npm run i18n:extract
```
**Output**:
- ✅ Translation_Task_DE.md (288 missing keys + context)
- ✅ Translation_Task_FR.md (288 missing keys + context)
- ✅ JSON reports for automation

---

### Phase 2: Professional Translation ⏳ PENDING
**Action Required**:
1. Contract German translator
   - Send: `docs/ui/Translation_Task_DE.md`
   - Format: JSON matching `src/messages/de.json` structure
   - Quality: Formal "Sie", special characters (ä, ö, ü, ß)
   - Budget: ~$150-200
   - Timeline: 2-3 business days

2. Contract French translator
   - Send: `docs/ui/Translation_Task_FR.md`
   - Format: JSON matching `src/messages/fr.json` structure
   - Quality: Formal "vous", accents (é, è, ê, à, ç)
   - Budget: ~$150-200
   - Timeline: 2-3 business days

**Deliverable**: Completed `de.json` and `fr.json` files

---

### Phase 3: Automated Validation ⏳ PENDING
```bash
# After receiving translations
npm run i18n:validate --locale=de
npm run i18n:validate --locale=fr
```

**Checks**:
- ✅ JSON structure valid
- ✅ All 589 keys present (100% coverage)
- ✅ UTF-8 encoding correct
- ✅ Special characters detected
- ⚠️ Length warnings (if translations >150% baseline)

**Expected Runtime**: 15 seconds per locale

---

### Phase 4: QA Sampling ⏳ PENDING
```bash
# Generate random sample for manual review
node scripts/validate-translations.js --locale=de --sample=50
node scripts/validate-translations.js --locale=fr --sample=50
```

**Manual Review**:
- Review 50 random keys per language (8.5% of 589)
- Check: Grammar, tone, consistency, special characters
- Target: ≥95% pass rate
- Time: 1 hour per language

**Reference**: See QA checklist in `Translation_QA_Workflow.md`

---

### Phase 5: UI Integration Testing ⏳ PENDING
```bash
# Test in local environment
npm run dev

# Test German
open http://localhost:3000/de

# Test French
open http://localhost:3000/fr
```

**Test Coverage**:
- ✅ All pages render (Home, Features, Pricing, Blog, Foundation)
- ✅ No text truncation or overflow
- ✅ Special characters display correctly
- ✅ Responsive: Mobile (375px), Tablet (768px), Desktop (1280px)

**Time**: 1-2 hours per language

---

### Phase 6: Native Speaker Review 🟡 OPTIONAL
**If budget allows**:
- Professional review of critical paths
- Quality score target: ≥4.0/5.0
- Focus: High-visibility areas (navigation, hero, features, pricing)
- Time: 1-2 hours per language
- Budget: Additional ~$100-150 per language

---

## 📋 Acceptance Criteria (Sprint 1)

### German Translation (Task 1.2)
- [ ] ✅ Automated validation: All checks pass
- [ ] ✅ QA sampling: ≥95% pass rate (50 keys)
- [ ] ✅ UI integration: All pages render correctly
- [ ] ✅ No layout breaks or truncation
- [ ] ✅ Special characters correct (ä, ö, ü, ß)
- [ ] ✅ CI/CD tests passing
- [ ] 🟡 Native speaker review: ≥4.0/5.0 (optional)

### French Translation (Task 1.3)
- [ ] ✅ Automated validation: All checks pass
- [ ] ✅ QA sampling: ≥95% pass rate (50 keys)
- [ ] ✅ UI integration: All pages render correctly
- [ ] ✅ No layout breaks or truncation
- [ ] ✅ All accents correct (é, è, ê, à, ç)
- [ ] ✅ Consistent "vous" usage
- [ ] ✅ CI/CD tests passing
- [ ] 🟡 Native speaker review: ≥4.0/5.0 (optional)

---

## 💰 Budget Summary

| Item | German | French | Total |
|------|--------|--------|-------|
| **Translation** (288 keys) | $150-200 | $150-200 | $300-400 |
| **Native Speaker Review** (optional) | $100-150 | $100-150 | $200-300 |
| **QA/Integration** (internal) | 3-4 hours | 3-4 hours | 6-8 hours |
| **Total External Cost** | $150-350 | $150-350 | $300-700 |

**Recommended Budget**: **$300-400** (without native speaker review)
**Premium Budget**: **$500-700** (with native speaker review)

---

## ⏱️ Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| **Phase 1**: Extraction | ✅ Complete | None |
| **Phase 2**: Translation | 2-3 business days | Translator availability |
| **Phase 3**: Validation | 15 minutes | Phase 2 complete |
| **Phase 4**: QA Sampling | 2 hours | Phase 3 passed |
| **Phase 5**: UI Testing | 3-4 hours | Phase 4 passed |
| **Phase 6**: Native Review | 1-2 days (optional) | Phase 5 passed |

**Total Timeline**: **4-7 business days** (without native review)
**With Native Review**: **6-10 business days**

---

## 🚨 Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Translation delays** | Medium | High | Contract backup translators |
| **Quality issues** | Medium | Medium | Automated validation + QA sampling |
| **UI breaks** | Low | High | Length validation + responsive testing |
| **Encoding errors** | Low | Medium | Automated UTF-8 checks |
| **Timeline overrun** | Medium | Medium | Buffer time in estimates |

---

## 📞 Contact Points

**For Translators**:
- Technical issues: development@coria.app
- Context questions: Review live site at coria.app/de or coria.app/fr
- Terminology: Check existing translations in `src/messages/de.json` or `fr.json`

**For QA Team**:
- Validation issues: Check `scripts/validate-translations.js`
- UI issues: Test with `npm run dev`
- Documentation: `docs/ui/Translation_QA_Workflow.md`

**For Project Manager**:
- Progress tracking: Check acceptance criteria above
- Budget questions: See budget summary
- Timeline questions: See timeline table

---

## 📈 Success Metrics

**Target Metrics After Completion**:

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| **i18n Coverage (DE)** | 51.9% | 100% | Automated validation |
| **i18n Coverage (FR)** | 51.9% | 100% | Automated validation |
| **QA Pass Rate** | N/A | ≥95% | Manual sampling |
| **UI Integration** | N/A | 100% | Manual testing |
| **Zero Critical Issues** | N/A | 0 bugs | Combined validation |

**Post-Completion Actions**:
1. Update UI_Audit.md metrics (i18n coverage: 53% → 100%)
2. Mark Task 1.2 and 1.3 as ✅ COMPLETE in UI_Remediation_Plan.md
3. Proceed to Sprint 2 tasks

---

## 🎯 Next Steps

### Immediate (This Week)
1. ✅ ~~Generate translator briefs~~ COMPLETE
2. ⏳ Contract German translator
3. ⏳ Contract French translator
4. ⏳ Send Translation_Task_*.md to translators

### After Translation Delivery (Next Week)
1. ⏳ Run automated validation
2. ⏳ Perform QA sampling
3. ⏳ UI integration testing
4. ⏳ Optional: Native speaker review
5. ⏳ Create PR and deploy

### Success Criteria
- [ ] All 576 missing keys translated
- [ ] 100% translation coverage for DE and FR
- [ ] All automated validations passing
- [ ] All acceptance criteria met
- [ ] Ready for production deployment

---

**Status**: ✅ **Phase 1 Complete - Ready for Translation**

**Action Required**: Contract translators and send task briefs

**Timeline**: 4-7 business days to completion

**Budget**: $300-400 (recommended) or $500-700 (with native review)
