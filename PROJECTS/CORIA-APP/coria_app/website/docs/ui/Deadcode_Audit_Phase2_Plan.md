# CORIA Website Deadcode Audit - Phase 2 Plan

**Status**: Ready for Execution
**Type**: CSS Token & Asset & UI Deduplication Analysis
**Estimated Duration**: 3-4 hours
**Risk Level**: Low-Medium (with HIGH CONFIDENCE labeling)
**Date**: 2025-01-16

---

## 🎯 Executive Summary

Phase 2 focuses on systematic identification of unused CSS tokens, orphaned assets, and duplicate UI components using automated scanning with HIGH CONFIDENCE classification.

### Scope & Objectives

**What Phase 2 Covers**:
1. **CSS Token Analysis**: Scan 150+ CSS variables from globals.css for unused tokens
2. **Asset Cleanup**: Identify unused images/SVGs in public/ with disk space savings
3. **UI Deduplication**: Find duplicate button/card/form components for consolidation

**Success Criteria**:
- ✅ HIGH CONFIDENCE items (0 references) ready for removal
- ✅ MEDIUM CONFIDENCE items (1-2 references) flagged for manual review
- ✅ PROTECTED items (safelist) clearly marked as untouchable
- ✅ Estimated bundle size reduction calculated
- ✅ Automated scanners generate audit-results/*.json files

### Phase 1 Learnings Applied

**From Phase 1 Validation Results**:
- ✅ Archive-based approach proved ZERO RISK (background-wrapper.tsx removal)
- ✅ Build + test validation caught 0 regressions
- ✅ Safelist protection system worked perfectly (Icon System v1.0, BrandBackground)
- ✅ Pre-existing issues clearly separated from cleanup impact

**Phase 2 Enhancements**:
- **HIGH CONFIDENCE Labeling**: 0 references = safe removal, 1-2 = review needed
- **Cross-Reference Validation**: Scan entire src/ and public/ for all reference patterns
- **Protected Asset Verification**: Double-check safelist compliance
- **Space Savings Metrics**: Calculate KB reduction for cost-benefit analysis

---

## 📊 HIGH CONFIDENCE Classification System

### Confidence Levels Defined

#### 🟢 HIGH CONFIDENCE (Safe to Remove)
- **Criteria**: 0 references found across entire codebase
- **Search Scope**: src/**/*.{ts,tsx,css,json} + public/**/*
- **Patterns Checked**: Direct usage, var() references, imports, src/url attributes
- **Action**: Archive or delete immediately after validation
- **Risk**: Minimal (0 active usage detected)

**Example - CSS Variable**:
```css
/* globals.css */
--unused-color: #FF0000; /* 0 var(--unused-color) found */
```

**Example - Asset**:
```
public/old-background.png  /* 0 src="..." or url(...) references */
```

#### 🟡 MEDIUM CONFIDENCE (Review Before Remove)
- **Criteria**: 1-2 references found, may be legacy or conditionally used
- **Search Scope**: Same as HIGH
- **Patterns Checked**: All patterns + dynamic string construction
- **Action**: Manual code review required before removal
- **Risk**: Low-Medium (potential dynamic usage)

**Example - CSS Variable**:
```css
--rare-color: #00FF00; /* 1 reference in old-component.tsx line 45 */
```

**Example - Asset**:
```
public/fallback-icon.png  /* 2 references in error-boundary.tsx, 404.tsx */
```

#### 🔴 PROTECTED (Never Remove)
- **Criteria**: In safelist OR critical to system functionality
- **Examples**:
  - Icon System v1.0 icons (75+ icons)
  - BrandBackground CSS variables (--cream-*, --coria-*, --foam, --mist)
  - Brand assets (logo, favicon, leaf-vein.svg)
  - I18n translation keys (pricing.*, foundation.*, features.*)
- **Action**: Skip entirely, do not flag in audit
- **Risk**: None (safelist protected)

### Labeling Algorithm

```javascript
function classifyConfidence(token, referenceCount, isSafelisted) {
  if (isSafelisted) {
    return { confidence: 'PROTECTED', recommendation: 'DO_NOT_TOUCH', reason: 'Safelist' };
  }

  if (referenceCount === 0) {
    return { confidence: 'HIGH', recommendation: 'SAFE_TO_REMOVE', reason: '0 references' };
  }

  if (referenceCount <= 2) {
    return { confidence: 'MEDIUM', recommendation: 'REVIEW_BEFORE_REMOVE', reason: `${referenceCount} references` };
  }

  return { confidence: 'LOW', recommendation: 'KEEP', reason: 'Active usage' };
}
```

---

## 🎨 CSS Token Scanner Implementation

### Scanner Specification: `scan-css-tokens.mjs`

**Input Files**:
- `src/app/globals.css` (150+ CSS variables)
- `src/styles/brand-background.css` (BrandBackground system)
- Any other CSS files in src/styles/

**Output File**: `docs/ui/audit-results/unused-css-tokens.json`

**Search Strategy**:
1. **Extract Phase**: Parse all CSS files for `--variable-name` patterns
2. **Reference Phase**: Search all src/**/*.{ts,tsx,css} for:
   - `var(--variable-name)` (direct usage)
   - `--variable-name` (CSS definitions and fallbacks)
   - Dynamic references like `style={{ color: 'var(--' + dynamicName + ')' }}`
3. **Classification Phase**: Apply HIGH/MEDIUM/PROTECTED labels
4. **Report Phase**: Generate JSON with removal candidates and space savings

**Safelist Integration**:
```javascript
const CSS_SAFELIST = {
  // BrandBackground System - PROTECTED
  brandBackground: [
    '--cream-50', '--cream-100', '--cream-200', '--cream-300',
    '--foam', '--mist', '--forest',
  ],

  // Core CORIA Colors - PROTECTED
  coriaColors: [
    '--coria-green', '--coria-primary', '--leaf', '--lime',
    '--earth', '--sky', '--coral', '--gold',
  ],

  // Animation/Transition Tokens - PROTECTED
  transitions: [
    '--transition-organic', '--transition-bounce',
    '--ease-out-cubic', '--ease-in-out-quart',
  ],

  // Pattern matching for dynamic usage
  dynamicPatterns: [
    /--cream-\d+/,  // --cream-50, --cream-100, etc.
    /--coria-/,     // Any CORIA brand color
  ],
};
```

**Output JSON Schema**:
```json
{
  "variables": {
    "total": 150,
    "high_confidence_unused": [
      {
        "token": "--unused-variable",
        "file": "src/app/globals.css",
        "line": 45,
        "confidence": "HIGH",
        "references": 0,
        "recommendation": "SAFE_TO_REMOVE",
        "search_scope": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.css"]
      }
    ],
    "medium_confidence_unused": [
      {
        "token": "--rare-variable",
        "file": "src/app/globals.css",
        "line": 67,
        "confidence": "MEDIUM",
        "references": 1,
        "reference_locations": [
          { "file": "src/components/legacy/old-card.tsx", "line": 23, "usage": "var(--rare-variable)" }
        ],
        "recommendation": "REVIEW_BEFORE_REMOVE"
      }
    ],
    "protected": [
      {
        "token": "--cream-50",
        "file": "src/app/globals.css",
        "line": 10,
        "confidence": "PROTECTED",
        "reason": "BrandBackground safelist",
        "recommendation": "DO_NOT_TOUCH"
      }
    ]
  },
  "utilityClasses": {
    "total": 80,
    "high_confidence_unused": [],
    "medium_confidence_unused": [],
    "protected": []
  },
  "summary": {
    "total_variables": 150,
    "high_confidence_removal_candidates": 12,
    "medium_confidence_review_needed": 5,
    "protected_variables": 45,
    "estimated_css_size_reduction_kb": 2.5
  },
  "analyzed_at": "2025-01-16T10:30:00.000Z"
}
```

### Implementation Script Template

**File**: `scripts/deadcode/scan-css-tokens.mjs`

```javascript
#!/usr/bin/env node
/**
 * CORIA Deadcode Audit Phase 2 - CSS Token Scanner
 * HIGH CONFIDENCE labeling for CSS variable removal
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

// === CONFIGURATION ===

const CSS_FILES = [
  './src/app/globals.css',
  './src/styles/brand-background.css',
];

const SRC_DIR = './src';
const PUBLIC_DIR = './public';
const RESULTS_FILE = './docs/ui/audit-results/unused-css-tokens.json';

// === SAFELIST ===

const CSS_SAFELIST = {
  brandBackground: [
    '--cream-50', '--cream-100', '--cream-200', '--cream-300',
    '--foam', '--mist', '--forest', '--leaf', '--lime',
  ],
  coriaColors: [
    '--coria-green', '--coria-primary', '--earth', '--sky', '--coral', '--gold',
  ],
  transitions: [
    '--transition-organic', '--transition-bounce',
  ],
  dynamicPatterns: [
    /--cream-\d+/,
    /--coria-/,
  ],
};

// === UTILITY FUNCTIONS ===

function extractCSSVariables(cssContent, filePath) {
  const variables = new Map();
  const lines = cssContent.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/--([a-zA-Z0-9-]+)/);
    if (match) {
      const varName = `--${match[1]}`;
      if (!variables.has(varName)) {
        variables.set(varName, {
          name: varName,
          file: filePath,
          line: index + 1,
          definition: line.trim(),
        });
      }
    }
  });

  return Array.from(variables.values());
}

function isTokenProtected(token) {
  // Check direct safelist
  if ([...CSS_SAFELIST.brandBackground, ...CSS_SAFELIST.coriaColors, ...CSS_SAFELIST.transitions].includes(token)) {
    return { protected: true, reason: 'Safelist' };
  }

  // Check pattern matching
  for (const pattern of CSS_SAFELIST.dynamicPatterns) {
    if (pattern.test(token)) {
      return { protected: true, reason: 'Dynamic pattern match' };
    }
  }

  return { protected: false };
}

function findTokenReferences(token, searchDir) {
  const references = [];

  function searchDirectory(dirPath) {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        searchDirectory(fullPath);
      } else if (/\.(tsx?|css)$/.test(item)) {
        const content = readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for var(--token) usage
          if (line.includes(`var(${token})`) || line.includes(token)) {
            references.push({
              file: relative(process.cwd(), fullPath),
              line: index + 1,
              usage: line.trim().substring(0, 80),
            });
          }
        });
      }
    }
  }

  searchDirectory(searchDir);
  return references;
}

function classifyConfidence(token, referenceCount, protectionStatus) {
  if (protectionStatus.protected) {
    return {
      confidence: 'PROTECTED',
      recommendation: 'DO_NOT_TOUCH',
      reason: protectionStatus.reason,
    };
  }

  if (referenceCount === 0) {
    return {
      confidence: 'HIGH',
      recommendation: 'SAFE_TO_REMOVE',
      reason: '0 references found',
    };
  }

  if (referenceCount <= 2) {
    return {
      confidence: 'MEDIUM',
      recommendation: 'REVIEW_BEFORE_REMOVE',
      reason: `${referenceCount} references found`,
    };
  }

  return {
    confidence: 'LOW',
    recommendation: 'KEEP',
    reason: 'Active usage detected',
  };
}

// === MAIN ANALYSIS ===

async function analyzeCSSTokens() {
  console.log('🎨 Phase 2: CSS Token Analysis with HIGH CONFIDENCE Labeling\n');

  const results = {
    variables: {
      total: 0,
      high_confidence_unused: [],
      medium_confidence_unused: [],
      protected: [],
    },
    summary: {
      total_variables: 0,
      high_confidence_removal_candidates: 0,
      medium_confidence_review_needed: 0,
      protected_variables: 0,
      estimated_css_size_reduction_kb: 0,
    },
    analyzed_at: new Date().toISOString(),
  };

  // Extract all CSS variables
  for (const cssFile of CSS_FILES) {
    try {
      const content = readFileSync(cssFile, 'utf-8');
      const variables = extractCSSVariables(content, cssFile);
      results.variables.total += variables.length;

      console.log(`   Analyzing ${variables.length} variables from ${cssFile}...`);

      for (const variable of variables) {
        const protectionStatus = isTokenProtected(variable.name);

        // Skip protected tokens
        if (protectionStatus.protected) {
          results.variables.protected.push({
            token: variable.name,
            file: relative(process.cwd(), variable.file),
            line: variable.line,
            confidence: 'PROTECTED',
            reason: protectionStatus.reason,
            recommendation: 'DO_NOT_TOUCH',
          });
          continue;
        }

        // Find references in src/ and public/
        const srcReferences = findTokenReferences(variable.name, SRC_DIR);
        const referenceCount = srcReferences.length;

        // Classify confidence
        const classification = classifyConfidence(variable.name, referenceCount, protectionStatus);

        const tokenInfo = {
          token: variable.name,
          file: relative(process.cwd(), variable.file),
          line: variable.line,
          confidence: classification.confidence,
          references: referenceCount,
          recommendation: classification.recommendation,
          reason: classification.reason,
        };

        if (classification.confidence === 'HIGH') {
          results.variables.high_confidence_unused.push(tokenInfo);
        } else if (classification.confidence === 'MEDIUM') {
          tokenInfo.reference_locations = srcReferences;
          results.variables.medium_confidence_unused.push(tokenInfo);
        }
      }
    } catch (error) {
      console.error(`   Error analyzing ${cssFile}:`, error.message);
    }
  }

  // Calculate summary
  results.summary.total_variables = results.variables.total;
  results.summary.high_confidence_removal_candidates = results.variables.high_confidence_unused.length;
  results.summary.medium_confidence_review_needed = results.variables.medium_confidence_unused.length;
  results.summary.protected_variables = results.variables.protected.length;

  // Estimate CSS size reduction (rough: 50 bytes per variable definition)
  results.summary.estimated_css_size_reduction_kb =
    (results.summary.high_confidence_removal_candidates * 50 +
     results.summary.medium_confidence_review_needed * 50) / 1024;

  // Write results
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  console.log('\n📊 CSS Token Analysis Results:');
  console.log(`   Total variables: ${results.summary.total_variables}`);
  console.log(`   🟢 HIGH confidence (safe to remove): ${results.summary.high_confidence_removal_candidates}`);
  console.log(`   🟡 MEDIUM confidence (review needed): ${results.summary.medium_confidence_review_needed}`);
  console.log(`   🔴 PROTECTED (safelist): ${results.summary.protected_variables}`);
  console.log(`   Estimated size reduction: ${results.summary.estimated_css_size_reduction_kb.toFixed(2)} KB`);
  console.log(`\n✅ Results saved to: ${RESULTS_FILE}\n`);

  return results;
}

// === RUN ANALYSIS ===

analyzeCSSTokens().catch(console.error);
```

**Execution**:
```bash
cd /Users/burakcemyaman/PROJECTS/CORIA-APP/coria_app/website
node scripts/deadcode/scan-css-tokens.mjs
```

---

## 🖼️ Asset Scanner Implementation

### Scanner Specification: `scan-assets.mjs`

**Input Directories**:
- `public/` (all images and SVG files)
- `public/images/` (nested image directories)

**Output File**: `docs/ui/audit-results/unused-assets.json`

**Search Strategy**:
1. **Discovery Phase**: Find all .svg, .png, .jpg, .jpeg, .webp, .gif files
2. **Reference Phase**: Search src/**/*.{ts,tsx,css,json} for:
   - `src="..."` attributes
   - `url(...)` CSS patterns
   - `import ... from '...'` statements
   - File name substring matching
3. **Size Calculation**: Calculate total KB for unused assets
4. **Classification Phase**: Apply HIGH/MEDIUM/PROTECTED labels

**Safelist Integration**:
```javascript
const ASSET_SAFELIST = {
  brandAssets: [
    'leaf-vein.svg',      // BrandBackground overlay
    'coria-app-logo.svg', // Brand logo
    'logo.svg',           // Alternative logo
  ],
  pwaIcons: [
    /^icon-\d+x\d+\.png$/,        // icon-192x192.png, icon-512x512.png
    /^apple-touch-icon.*\.png$/,  // apple-touch-icon.png
    /^favicon.*\.(png|ico)$/,     // favicon.png, favicon.ico
  ],
  criticalImages: [
    // Team photos, feature screenshots - check manually
  ],
};
```

**Output JSON Schema**:
```json
{
  "assets": {
    "total": 45,
    "high_confidence_unused": [
      {
        "file": "public/old-background.png",
        "size_kb": 125.3,
        "confidence": "HIGH",
        "references": 0,
        "recommendation": "SAFE_TO_DELETE",
        "last_modified": "2024-10-15T12:00:00.000Z"
      }
    ],
    "medium_confidence_unused": [
      {
        "file": "public/images/fallback-icon.png",
        "size_kb": 15.7,
        "confidence": "MEDIUM",
        "references": 2,
        "reference_locations": [
          { "file": "src/app/error.tsx", "line": 15, "usage": "src=\"/images/fallback-icon.png\"" }
        ],
        "recommendation": "REVIEW_BEFORE_DELETE"
      }
    ],
    "protected": [
      {
        "file": "public/leaf-vein.svg",
        "size_kb": 8.2,
        "confidence": "PROTECTED",
        "reason": "BrandBackground safelist",
        "recommendation": "DO_NOT_DELETE"
      }
    ]
  },
  "summary": {
    "total_assets": 45,
    "high_confidence_removal_candidates": 8,
    "medium_confidence_review_needed": 3,
    "protected_assets": 10,
    "estimated_space_savings_kb": 456.7,
    "estimated_space_savings_mb": 0.45
  },
  "analyzed_at": "2025-01-16T10:45:00.000Z"
}
```

### Implementation Script Template

**File**: `scripts/deadcode/scan-assets.mjs`

```javascript
#!/usr/bin/env node
/**
 * CORIA Deadcode Audit Phase 2 - Asset Scanner
 * HIGH CONFIDENCE labeling for unused image/SVG deletion
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative, basename } from 'path';

// === CONFIGURATION ===

const PUBLIC_DIR = './public';
const SRC_DIR = './src';
const RESULTS_FILE = './docs/ui/audit-results/unused-assets.json';

// === SAFELIST ===

const ASSET_SAFELIST = {
  brandAssets: [
    'leaf-vein.svg',
    'coria-app-logo.svg',
    'logo.svg',
  ],
  pwaIcons: [
    /^icon-\d+x\d+\.png$/,
    /^apple-touch-icon.*\.png$/,
    /^favicon.*\.(png|ico)$/,
  ],
};

// === UTILITY FUNCTIONS ===

function findAllAssets(dir) {
  const assets = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.')) {
      assets.push(...findAllAssets(fullPath));
    } else if (/\.(svg|png|jpg|jpeg|webp|gif)$/i.test(item)) {
      assets.push({
        path: fullPath,
        name: item,
        size: stat.size,
        lastModified: stat.mtime,
      });
    }
  }

  return assets;
}

function isAssetProtected(assetName) {
  // Check direct safelist
  if (ASSET_SAFELIST.brandAssets.includes(assetName)) {
    return { protected: true, reason: 'Brand asset safelist' };
  }

  // Check pattern matching
  for (const pattern of ASSET_SAFELIST.pwaIcons) {
    if (pattern.test(assetName)) {
      return { protected: true, reason: 'PWA icon pattern' };
    }
  }

  return { protected: false };
}

function findAssetReferences(asset, searchDir) {
  const references = [];
  const assetName = basename(asset.path);
  const assetNameWithoutExt = assetName.replace(/\.[^.]+$/, '');

  function searchDirectory(dirPath) {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        searchDirectory(fullPath);
      } else if (/\.(tsx?|css|json)$/.test(item)) {
        const content = readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check multiple patterns
          if (
            line.includes(assetName) ||
            line.includes(assetNameWithoutExt) ||
            /src=["'][^"']*/.test(line) && line.includes(assetName) ||
            /url\([^)]*/.test(line) && line.includes(assetName)
          ) {
            references.push({
              file: relative(process.cwd(), fullPath),
              line: index + 1,
              usage: line.trim().substring(0, 80),
            });
          }
        });
      }
    }
  }

  searchDirectory(searchDir);
  return references;
}

// === MAIN ANALYSIS ===

async function analyzeAssets() {
  console.log('🖼️  Phase 2: Asset Analysis with HIGH CONFIDENCE Labeling\n');

  const assets = findAllAssets(PUBLIC_DIR);
  console.log(`   Found ${assets.length} image assets\n`);

  const results = {
    assets: {
      total: assets.length,
      high_confidence_unused: [],
      medium_confidence_unused: [],
      protected: [],
    },
    summary: {
      total_assets: assets.length,
      high_confidence_removal_candidates: 0,
      medium_confidence_review_needed: 0,
      protected_assets: 0,
      estimated_space_savings_kb: 0,
      estimated_space_savings_mb: 0,
    },
    analyzed_at: new Date().toISOString(),
  };

  for (const asset of assets) {
    const protectionStatus = isAssetProtected(asset.name);

    // Skip protected assets
    if (protectionStatus.protected) {
      results.assets.protected.push({
        file: relative(process.cwd(), asset.path),
        size_kb: (asset.size / 1024).toFixed(2),
        confidence: 'PROTECTED',
        reason: protectionStatus.reason,
        recommendation: 'DO_NOT_DELETE',
      });
      continue;
    }

    // Find references
    const references = findAssetReferences(asset, SRC_DIR);
    const referenceCount = references.length;

    const assetInfo = {
      file: relative(process.cwd(), asset.path),
      size_kb: parseFloat((asset.size / 1024).toFixed(2)),
      references: referenceCount,
      last_modified: asset.lastModified.toISOString(),
    };

    if (referenceCount === 0) {
      assetInfo.confidence = 'HIGH';
      assetInfo.recommendation = 'SAFE_TO_DELETE';
      assetInfo.reason = '0 references found';
      results.assets.high_confidence_unused.push(assetInfo);
    } else if (referenceCount <= 2) {
      assetInfo.confidence = 'MEDIUM';
      assetInfo.recommendation = 'REVIEW_BEFORE_DELETE';
      assetInfo.reason = `${referenceCount} references found`;
      assetInfo.reference_locations = references;
      results.assets.medium_confidence_unused.push(assetInfo);
    }
  }

  // Calculate summary
  results.summary.high_confidence_removal_candidates = results.assets.high_confidence_unused.length;
  results.summary.medium_confidence_review_needed = results.assets.medium_confidence_unused.length;
  results.summary.protected_assets = results.assets.protected.length;

  // Calculate space savings
  const highConfidenceSavings = results.assets.high_confidence_unused.reduce((sum, a) => sum + a.size_kb, 0);
  const mediumConfidenceSavings = results.assets.medium_confidence_unused.reduce((sum, a) => sum + a.size_kb, 0);
  results.summary.estimated_space_savings_kb = highConfidenceSavings + mediumConfidenceSavings;
  results.summary.estimated_space_savings_mb = (results.summary.estimated_space_savings_kb / 1024).toFixed(2);

  // Write results
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  console.log('📊 Asset Analysis Results:');
  console.log(`   Total assets: ${results.summary.total_assets}`);
  console.log(`   🟢 HIGH confidence (safe to delete): ${results.summary.high_confidence_removal_candidates}`);
  console.log(`   🟡 MEDIUM confidence (review needed): ${results.summary.medium_confidence_review_needed}`);
  console.log(`   🔴 PROTECTED (safelist): ${results.summary.protected_assets}`);
  console.log(`   Estimated space savings: ${results.summary.estimated_space_savings_mb} MB`);
  console.log(`\n✅ Results saved to: ${RESULTS_FILE}\n`);

  return results;
}

// === RUN ANALYSIS ===

analyzeAssets().catch(console.error);
```

**Execution**:
```bash
node scripts/deadcode/scan-assets.mjs
```

---

## 🔄 Duplicate UI Component Targets

### Manual Review Strategy

Phase 2 will identify duplicate UI component patterns through manual analysis, as automated duplicate detection requires semantic understanding beyond string matching.

### Target Component Categories

#### 1. Background/Gradient Components
**Status from Phase 1**: ✅ COMPLETE
- **Removed**: background-wrapper.tsx (unused duplicate)
- **Active**: ClientBackground.tsx, BrandBackground.tsx
- **Action**: No further action needed

#### 2. Button Components
**Search Command**:
```bash
find src/components -name "*button*.tsx" -type f
```

**Expected Findings**: Multiple button implementations

**Duplication Analysis Criteria**:
- **Semantic Duplicates**: Same onClick behavior, same styling patterns
- **Variant Duplicates**: Minor prop differences (size, color) that could be unified
- **Intentional Variants**: CTA button vs. outline button (keep separate)

**Action Plan**:
- List all button files
- Compare prop interfaces
- Identify consolidation opportunities
- Document intentional variants

**Deliverable**: `docs/ui/audit-results/button-components-analysis.md`

#### 3. Card Components
**Search Command**:
```bash
find src/components -name "*card*.tsx" -type f
```

**Duplication Analysis Criteria**:
- Feature cards vs. blog cards (likely intentional variants)
- Testimonial cards vs. pricing cards (likely intentional)
- Generic card wrapper duplicates (consolidation candidates)

**Action Plan**:
- List all card files
- Compare styling and structure
- Identify base card + variant pattern opportunities

**Deliverable**: `docs/ui/audit-results/card-components-analysis.md`

#### 4. Form Components
**Search Command**:
```bash
find src/components -name "*form*.tsx" -o -name "*input*.tsx" -type f
```

**Duplication Analysis Criteria**:
- Contact form vs. Foundation apply form (likely separate)
- Shared input components (potential consolidation)
- Validation logic duplication (extract to utility)

**Action Plan**:
- List all form-related files
- Compare validation patterns
- Identify shared form logic

**Deliverable**: `docs/ui/audit-results/form-components-analysis.md`

### Component Duplication Output Template

**File**: `docs/ui/audit-results/duplicate-ui-components.json`

```json
{
  "buttons": {
    "total_found": 5,
    "duplicates": [
      {
        "group": "CTA Buttons",
        "files": [
          "src/components/ui/button.tsx",
          "src/components/sections/cta-button.tsx"
        ],
        "similarity_score": 0.85,
        "recommendation": "Consolidate into single component with variant prop",
        "confidence": "MEDIUM"
      }
    ],
    "intentional_variants": [
      {
        "files": [
          "src/components/ui/button.tsx",
          "src/components/ui/outline-button.tsx"
        ],
        "reason": "Different semantic meaning (primary vs. secondary actions)"
      }
    ]
  },
  "cards": {
    "total_found": 8,
    "duplicates": [],
    "intentional_variants": [
      {
        "files": [
          "src/components/ui/card.tsx",
          "src/components/features/feature-card.tsx",
          "src/components/blog/blog-card.tsx"
        ],
        "reason": "Domain-specific styling and content structure"
      }
    ]
  },
  "forms": {
    "total_found": 6,
    "duplicates": [
      {
        "group": "Input Validation",
        "files": [
          "src/components/contact/contact-form.tsx",
          "src/components/foundation/apply-form.tsx"
        ],
        "similarity_score": 0.70,
        "recommendation": "Extract shared validation logic to utility",
        "confidence": "HIGH"
      }
    ]
  },
  "summary": {
    "total_components_analyzed": 19,
    "consolidation_opportunities": 2,
    "estimated_code_reduction_lines": 150
  },
  "analyzed_at": "2025-01-16T11:00:00.000Z"
}
```

---

## 📋 Phase 2 Execution Workflow

### Step-by-Step Process

#### **Step 1: Setup (5 min)**
```bash
cd /Users/burakcemyaman/PROJECTS/CORIA-APP/coria_app/website

# Verify directory structure
ls -la scripts/deadcode/
ls -la docs/ui/audit-results/

# Make scripts executable
chmod +x scripts/deadcode/scan-css-tokens.mjs
chmod +x scripts/deadcode/scan-assets.mjs
```

#### **Step 2: CSS Token Analysis (45 min)**
```bash
# Run CSS token scanner
node scripts/deadcode/scan-css-tokens.mjs

# Review results
cat docs/ui/audit-results/unused-css-tokens.json | jq '.summary'

# Inspect HIGH confidence candidates
cat docs/ui/audit-results/unused-css-tokens.json | jq '.variables.high_confidence_unused'

# Inspect MEDIUM confidence candidates (manual review needed)
cat docs/ui/audit-results/unused-css-tokens.json | jq '.variables.medium_confidence_unused'
```

**Expected Output**:
```
📊 CSS Token Analysis Results:
   Total variables: 150
   🟢 HIGH confidence (safe to remove): 12
   🟡 MEDIUM confidence (review needed): 5
   🔴 PROTECTED (safelist): 45
   Estimated size reduction: 2.5 KB

✅ Results saved to: docs/ui/audit-results/unused-css-tokens.json
```

#### **Step 3: Asset Analysis (30 min)**
```bash
# Run asset scanner
node scripts/deadcode/scan-assets.mjs

# Review results
cat docs/ui/audit-results/unused-assets.json | jq '.summary'

# Inspect HIGH confidence candidates
cat docs/ui/audit-results/unused-assets.json | jq '.assets.high_confidence_unused'

# Calculate space savings
cat docs/ui/audit-results/unused-assets.json | jq '.summary.estimated_space_savings_mb'
```

**Expected Output**:
```
📊 Asset Analysis Results:
   Total assets: 45
   🟢 HIGH confidence (safe to delete): 8
   🟡 MEDIUM confidence (review needed): 3
   🔴 PROTECTED (safelist): 10
   Estimated space savings: 0.45 MB

✅ Results saved to: docs/ui/audit-results/unused-assets.json
```

#### **Step 4: Duplicate UI Analysis (60 min)**
```bash
# Find button components
find src/components -name "*button*.tsx" -type f > docs/ui/audit-results/buttons-list.txt

# Find card components
find src/components -name "*card*.tsx" -type f > docs/ui/audit-results/cards-list.txt

# Find form components
find src/components -name "*form*.tsx" -o -name "*input*.tsx" -type f > docs/ui/audit-results/forms-list.txt

# Manual review required - compare files for duplication patterns
```

#### **Step 5: Generate Consolidated Report (30 min)**

Create comprehensive Phase 2 audit report combining all analysis results.

---

## 📊 Phase 2 Validation & Testing

### Validation Checklist

Before proceeding with Phase 2 removals:

#### **Safelist Verification**
- [ ] All protected CSS variables marked correctly
- [ ] All brand assets (logo, favicon, leaf-vein.svg) in safelist
- [ ] BrandBackground system CSS untouched
- [ ] Icon System v1.0 icons not flagged

#### **HIGH Confidence Validation**
- [ ] Manually verify 0 references for HIGH confidence CSS tokens
- [ ] Manually verify 0 references for HIGH confidence assets
- [ ] Cross-check with build output (no runtime errors)

#### **MEDIUM Confidence Review**
- [ ] Inspect each MEDIUM confidence CSS token manually
- [ ] Verify 1-2 references are legacy or can be refactored
- [ ] Document decision to keep or remove

#### **Duplicate UI Review**
- [ ] Compare button components for semantic duplication
- [ ] Verify card components are intentionally different
- [ ] Check form validation logic for extractable utilities

### Testing Strategy

#### **After CSS Token Removal**
```bash
# Remove HIGH confidence CSS tokens from globals.css
# Then validate:

npm run build                                      # Must succeed
npm test -- --run                                  # All tests pass
npm run lint                                       # No new CSS warnings

# Visual validation
npm run dev
# Manually check:
# - All pages render correctly
# - BrandBackground animation works
# - No missing colors or styles
```

#### **After Asset Deletion**
```bash
# Delete HIGH confidence unused assets
# Then validate:

npm run build                                      # Must succeed
find .next/static -name "*.{png,svg,jpg}" | wc -l # Check asset copying

# Visual validation
npm run dev
# Manually check:
# - All images load
# - No 404s in Network tab
# - Favicon displays correctly
```

---

## 🎯 Phase 2 Success Criteria

### Must-Have Deliverables

✅ **Automated Scanner Outputs**:
- `docs/ui/audit-results/unused-css-tokens.json` with HIGH/MEDIUM/PROTECTED labels
- `docs/ui/audit-results/unused-assets.json` with space savings calculated
- `docs/ui/audit-results/duplicate-ui-components.json` with consolidation targets

✅ **Manual Analysis Reports**:
- `docs/ui/audit-results/button-components-analysis.md`
- `docs/ui/audit-results/card-components-analysis.md`
- `docs/ui/audit-results/form-components-analysis.md`

✅ **Validation Results**:
- Safelist verification passed
- HIGH confidence items validated (0 references confirmed)
- MEDIUM confidence items reviewed (decisions documented)

### Success Metrics

**Quantitative Goals**:
- 🎯 CSS Token Reduction: 10-15 unused variables identified
- 🎯 Asset Cleanup: 0.3-0.5 MB space savings
- 🎯 UI Deduplication: 2-3 consolidation opportunities found
- 🎯 Total Impact: ~3-5 KB CSS reduction + 300-500 KB asset reduction

**Qualitative Goals**:
- ✅ All protected assets remain untouched
- ✅ HIGH confidence classifications proven accurate
- ✅ Zero false positives in removal candidates
- ✅ Clear documentation for manual review items

---

## ⚠️ Risk Assessment & Mitigation

### Phase 2 Risk Factors

#### 🟡 Medium Risk: CSS Token Removal
**Risk**: Dynamic CSS usage not detected by scanner
**Example**: `style={{ color: 'var(--' + dynamicColor + ')' }}`
**Mitigation**:
- Manual code review for template literal CSS variables
- Test all pages with dynamic styles (theme switching, user preferences)
- Keep MEDIUM confidence items for manual review

#### 🟡 Medium Risk: Asset Deletion
**Risk**: Assets referenced in external docs or marketing materials
**Example**: Image used in README.md outside src/
**Mitigation**:
- Search entire project root (not just src/) for asset references
- Check docs/, README.md, CHANGELOG.md for image links
- Verify no hardcoded URLs in external documentation

#### 🟢 Low Risk: UI Component Analysis
**Risk**: Misidentifying intentional variants as duplicates
**Mitigation**:
- Manual comparison of component purposes
- Document intentional design decisions
- Only consolidate when semantic duplication confirmed

### Rollback Strategy

**If Phase 2 causes issues**:
```bash
# Option 1: Restore from git (if changes committed)
git log --oneline                                  # Find commit before Phase 2
git revert <commit-hash>

# Option 2: Restore from archive (if archive created)
cp _archive/deadcode-phase2-20250116/* src/

# Option 3: Revert specific CSS tokens
# Manually add back removed variables to globals.css

# Option 4: Restore deleted assets
# Re-upload assets from backup (ensure backup exists!)
```

---

## 📈 Phase 2 Timeline & Effort Estimate

### Time Breakdown

| Phase | Task | Duration | Effort |
|-------|------|----------|--------|
| **Setup** | Create scripts directory, safelist | 15 min | Low |
| **CSS Analysis** | Run scanner, review results | 45 min | Low |
| **Asset Analysis** | Run scanner, review results | 30 min | Low |
| **UI Duplication** | Manual component comparison | 60 min | Medium |
| **Validation** | Test all HIGH confidence items | 30 min | Medium |
| **Documentation** | Write analysis reports | 30 min | Low |
| **Buffer** | Unexpected issues, re-scans | 30 min | - |
| **TOTAL** | | **3.5 hours** | |

### Recommended Execution Schedule

**Single Session Approach** (Recommended):
- Allocate 4-hour block
- Run all scanners in sequence
- Review results immediately while context is fresh
- Generate consolidated report at end

**Multi-Session Approach** (If needed):
- **Session 1** (1.5h): CSS + Asset scanning
- **Session 2** (1.5h): UI duplication analysis
- **Session 3** (1h): Validation + documentation

---

## 🚀 Next Steps After Phase 2

### Immediate Actions (Post-Phase 2)

1. **Review Phase 2 Audit Results**
   - Read all JSON outputs
   - Verify HIGH confidence candidates
   - Make decisions on MEDIUM confidence items

2. **Create Phase 2 Removal Patch**
   - Generate git patch for HIGH confidence removals
   - Test patch in isolated branch
   - Validate build + tests pass

3. **Execute Phase 2 Cleanup**
   - Apply patch if validation successful
   - Create backup before deletion
   - Monitor for 48h post-deployment

### Phase 3 Planning (Optional)

**Scope**: TypeScript export analysis and removal
- Unused function exports
- Unused type interfaces
- Unused utility functions
- Dead code elimination via tree-shaking analysis

**Estimated Timeline**: 2-3 hours
**Depends On**: Phase 2 completion and validation success

---

## 📚 Appendix: Reference Documentation

### Related Phase 1 Documents
- `docs/ui/Deadcode_Cleanup_Ph1_Summary.md` - Phase 1 execution report
- `docs/ui/Deadcode_Cleanup_Validation.md` - Phase 1 validation results
- `test-results/deadcode/validation-summary.md` - Quick reference
- `_archive/deadcode-20250116/ARCHIVE_INDEX.md` - Archived file index

### Phase 2 Output Files
- `docs/ui/audit-results/unused-css-tokens.json` - CSS token analysis
- `docs/ui/audit-results/unused-assets.json` - Asset analysis
- `docs/ui/audit-results/duplicate-ui-components.json` - UI duplication analysis
- `docs/ui/audit-results/button-components-analysis.md` - Button duplication report
- `docs/ui/audit-results/card-components-analysis.md` - Card duplication report
- `docs/ui/audit-results/form-components-analysis.md` - Form duplication report

### Scanner Scripts
- `scripts/deadcode/safelist.ts` - Protected assets registry (from Phase 1 workflow)
- `scripts/deadcode/scan-css-tokens.mjs` - CSS token scanner with HIGH confidence
- `scripts/deadcode/scan-assets.mjs` - Asset scanner with space savings

---

**Phase 2 Plan Complete** ✅
**Status**: Ready for Execution
**Next Action**: Run CSS token scanner to generate first audit results
**Estimated Total Time**: 3.5-4 hours
**Risk Level**: Low-Medium (with proper validation)
