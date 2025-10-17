# CORIA Website Deadcode & Duplication Audit Workflow

**Status**: Ready for Execution
**Type**: Dry-Run Analysis (Non-Breaking)
**Estimated Duration**: 2-3 hours
**Risk Level**: Low (review before apply)

---

## 🎯 Executive Summary

Comprehensive audit to identify and safely remove:
- Unused TypeScript exports, components, and utilities
- Unused CSS variables, tokens, and utility classes
- Unused image assets and SVG files
- Duplicate UI components with identical functionality

**Safety-First Approach**: All operations are dry-run with manual review gates before any deletions.

---

## 📋 Phase 1: Pre-Audit Preparation (15 min)

### 1.1 Create Safelist Registry

**Critical Protected Assets** (Never flag for removal):

```typescript
// scripts/deadcode/safelist.ts
export const SAFELIST = {
  // Icon System v1.0 - ALL icons in icons-map.ts are protected
  icons: [
    'apple', 'google-play', 'play', 'check', 'close', 'x', 'refresh',
    'shield-check', 'arrow-up', 'chevron-down', 'envelope', 'chat',
    'question', 'star', 'coria-foundation', 'heart', 'leaf',
    'vegan-analysis', 'ai-assistant', 'smart-pantry', 'community',
    'esg-score', 'carbon-water', 'carbon', 'water', 'sustainability',
    'green-energy', 'cycle', 'token-economy', 'transparency',
    'impact-focus', 'ai-assistant-svg', 'smart-pantry-svg',
    'community-svg', 'sustainability-svg', 'health', 'esg-score-svg',
    'carbon-water-svg', 'vegan-allergen', 'vegan-user', 'parents',
    'testimonial-analytics', 'testimonial-chat', 'testimonial-foundation',
    'twitter', 'linkedin', 'instagram', 'youtube', 'facebook',
    'home', 'menu', 'search', 'user', 'settings', 'filter', 'bell',
    'download', 'upload', 'share', 'plus', 'minus', 'arrow-down',
    'arrow-left', 'arrow-right', 'chevron-left', 'chevron-right',
    'sort', 'cart', 'external-link', 'globe', 'language', 'wallet',
    'alert-triangle', 'bug', 'info', 'bar-chart', 'trending-up',
    'file-text', 'flask', 'smartphone', 'book-open'
  ],

  // Runtime dynamic icon selections (string-based)
  dynamicIcons: [
    /Icon name="[^"]+"/g,  // <Icon name="..." /> patterns
    /iconName:\s*["']([^"']+)["']/g,  // iconName: "..." patterns
  ],

  // I18n translation keys (never remove)
  i18nKeys: [
    /messages\/(tr|en|de|fr)\.json/,
    /pricing\./,
    /foundation\./,
    /features\./,
    /about\./,
    /contact\./,
    /social\./,
  ],

  // BrandBackground and style system
  criticalStyles: [
    'BrandBackground',
    'brand-bg',
    'brand-bg-canvas',
    'brand-bg-leaf-pattern',
    'brand-bg-static',
    'brand-bg-animated-gradient',
    '--cream-50', '--cream-100', '--cream-200', '--cream-300',
    '--coria-green', '--coria-primary', '--foam', '--mist',
    '--leaf', '--forest', '--lime', '--earth', '--sky', '--coral', '--gold',
  ],

  // Critical components (never flag)
  criticalComponents: [
    'src/components/layout/navigation.tsx',
    'src/components/layout/footer.tsx',
    'src/components/layout/background-wrapper.tsx',
    'src/components/ui/BrandBackground.tsx',
    'src/components/icons/icons-map.ts',
    'src/app/globals.css',
    'src/styles/brand-background.css',
  ],

  // Protected assets
  protectedAssets: [
    'public/leaf-vein.svg',  // Used by BrandBackground
    'public/coria-app-logo.svg',  // Brand logo
    'public/favicon-*.png',  // Favicon variants
    'public/icon-*.png',  // PWA icons
    'public/apple-touch-icon.png',  // iOS icon
  ],
};
```

### 1.2 Setup Audit Directory Structure

```bash
mkdir -p scripts/deadcode
mkdir -p docs/ui/audit-results
```

---

## 📊 Phase 2: TypeScript Export Analysis (30 min)

### 2.1 Unused Export Detection Script

Create **`scripts/deadcode/scan-exports.mjs`**:

```javascript
#!/usr/bin/env node
/**
 * CORIA Deadcode Audit - Unused Export Scanner
 * Finds exported but never imported symbols
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { SAFELIST } from './safelist.ts';

const SRC_DIR = './src';
const RESULTS_FILE = './docs/ui/audit-results/unused-exports.json';

// Find all TS/TSX files
function findAllFiles(dir, extensions = ['.ts', '.tsx']) {
  let files = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.')) {
      files = files.concat(findAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

// Extract exports from a file
function extractExports(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const exports = [];

  // Named exports
  const namedExportRegex = /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
  let match;
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.push({ name: match[1], type: 'named', line: content.substring(0, match.index).split('\n').length });
  }

  // Export { ... } statements
  const exportListRegex = /export\s+\{([^}]+)\}/g;
  while ((match = exportListRegex.exec(content)) !== null) {
    const names = match[1].split(',').map(n => n.trim().split(' as ')[0].trim());
    names.forEach(name => {
      exports.push({ name, type: 'list', line: content.substring(0, match.index).split('\n').length });
    });
  }

  // Default export
  if (content.includes('export default')) {
    const defaultMatch = /export\s+default\s+(\w+)/.exec(content);
    if (defaultMatch) {
      exports.push({ name: defaultMatch[1], type: 'default', line: content.substring(0, defaultMatch.index).split('\n').length });
    }
  }

  return exports;
}

// Find imports of a symbol
function findImports(symbol, allFiles, excludeFile) {
  let importCount = 0;
  const importLocations = [];

  for (const file of allFiles) {
    if (file === excludeFile) continue;

    const content = readFileSync(file, 'utf-8');

    // Check for various import patterns
    const patterns = [
      new RegExp(`import\\s+{[^}]*\\b${symbol}\\b[^}]*}`, 'g'),
      new RegExp(`import\\s+${symbol}\\b`, 'g'),
      new RegExp(`import\\s+.*\\bas\\s+${symbol}\\b`, 'g'),
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        importCount += matches.length;
        importLocations.push({
          file: relative(process.cwd(), file),
          matches: matches.length
        });
      }
    }
  }

  return { importCount, importLocations };
}

// Check if symbol is in safelist
function isSafelisted(symbolName, filePath) {
  // Check icon safelist
  if (SAFELIST.icons.includes(symbolName)) return true;

  // Check critical components
  if (SAFELIST.criticalComponents.some(path => filePath.includes(path))) return true;

  // Check dynamic patterns
  if (SAFELIST.dynamicIcons.some(pattern => pattern.test(symbolName))) return true;

  return false;
}

// Main analysis
async function analyzeExports() {
  console.log('🔍 Scanning TypeScript exports...\n');

  const allFiles = findAllFiles(SRC_DIR);
  console.log(`Found ${allFiles.length} TypeScript files\n`);

  const results = {
    totalExports: 0,
    unusedExports: [],
    safelistedExports: [],
    analyzedAt: new Date().toISOString(),
  };

  for (const file of allFiles) {
    const exports = extractExports(file);
    results.totalExports += exports.length;

    for (const exp of exports) {
      // Skip if safelisted
      if (isSafelisted(exp.name, file)) {
        results.safelistedExports.push({
          symbol: exp.name,
          file: relative(process.cwd(), file),
          reason: 'Protected by safelist'
        });
        continue;
      }

      // Find imports
      const { importCount, importLocations } = findImports(exp.name, allFiles, file);

      if (importCount === 0) {
        results.unusedExports.push({
          symbol: exp.name,
          type: exp.type,
          file: relative(process.cwd(), file),
          line: exp.line,
          confidence: 'HIGH',
          recommendation: 'SAFE_TO_REMOVE'
        });
      }
    }
  }

  // Write results
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  console.log('📊 Export Analysis Results:');
  console.log(`   Total exports: ${results.totalExports}`);
  console.log(`   Unused exports: ${results.unusedExports.length}`);
  console.log(`   Safelisted exports: ${results.safelistedExports.length}`);
  console.log(`\n✅ Results saved to: ${RESULTS_FILE}\n`);

  return results;
}

// Run analysis
analyzeExports().catch(console.error);
```

### 2.2 Execute Export Analysis

```bash
cd /Users/burakcemyaman/PROJECTS/CORIA-APP/coria_app/website
node scripts/deadcode/scan-exports.mjs
```

**Expected Output**:
```
📊 Export Analysis Results:
   Total exports: 450
   Unused exports: 25-40 (estimate)
   Safelisted exports: 200-250
```

---

## 🎨 Phase 3: CSS Token Analysis (30 min)

### 3.1 Unused CSS Variable Scanner

Create **`scripts/deadcode/scan-css-tokens.mjs`**:

```javascript
#!/usr/bin/env node
/**
 * CORIA Deadcode Audit - CSS Token Scanner
 * Finds unused CSS variables and utility classes
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { SAFELIST } from './safelist.ts';

const CSS_FILES = [
  './src/app/globals.css',
  './src/styles/brand-background.css',
  './src/styles/critical.css',
];

const SRC_DIR = './src';
const RESULTS_FILE = './docs/ui/audit-results/unused-css-tokens.json';

// Extract CSS variables
function extractCSSVariables(cssContent) {
  const variables = new Set();
  const varRegex = /--[\w-]+/g;
  let match;

  while ((match = varRegex.exec(cssContent)) !== null) {
    variables.add(match[0]);
  }

  return Array.from(variables);
}

// Extract utility classes
function extractUtilityClasses(cssContent) {
  const classes = new Set();
  const classRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*)/g;
  let match;

  while ((match = classRegex.exec(cssContent)) !== null) {
    // Skip pseudo-classes and media query classes
    if (!match[1].startsWith(':') && !match[1].startsWith('@')) {
      classes.add(match[1]);
    }
  }

  return Array.from(classes);
}

// Find usage in codebase
function findUsageInFiles(token, dir) {
  let usageCount = 0;
  const usageLocations = [];

  function searchDirectory(dirPath) {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        searchDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.css')) {
        const content = readFileSync(fullPath, 'utf-8');

        // For CSS variables, search for var(--token) and direct usage
        const varPattern = new RegExp(`(var\\(${token}\\)|${token})`, 'g');
        const matches = content.match(varPattern);

        if (matches) {
          usageCount += matches.length;
          usageLocations.push({
            file: relative(process.cwd(), fullPath),
            count: matches.length
          });
        }
      }
    }
  }

  searchDirectory(dir);
  return { usageCount, usageLocations };
}

// Check if token is safelisted
function isTokenSafelisted(token) {
  return SAFELIST.criticalStyles.some(pattern => {
    if (typeof pattern === 'string') {
      return token.includes(pattern);
    }
    return pattern.test(token);
  });
}

// Main analysis
async function analyzeCSSTokens() {
  console.log('🎨 Scanning CSS tokens and utility classes...\n');

  const results = {
    variables: {
      total: 0,
      unused: [],
      safelisted: [],
    },
    utilityClasses: {
      total: 0,
      unused: [],
      safelisted: [],
    },
    analyzedAt: new Date().toISOString(),
  };

  // Analyze each CSS file
  for (const cssFile of CSS_FILES) {
    try {
      const content = readFileSync(cssFile, 'utf-8');

      // CSS Variables
      const variables = extractCSSVariables(content);
      results.variables.total += variables.length;

      for (const variable of variables) {
        // Skip if safelisted
        if (isTokenSafelisted(variable)) {
          results.variables.safelisted.push({
            token: variable,
            file: relative(process.cwd(), cssFile),
            reason: 'Protected by safelist'
          });
          continue;
        }

        // Find usage
        const { usageCount, usageLocations } = findUsageInFiles(variable, SRC_DIR);

        if (usageCount === 0) {
          results.variables.unused.push({
            token: variable,
            file: relative(process.cwd(), cssFile),
            confidence: 'HIGH',
            recommendation: 'SAFE_TO_REMOVE'
          });
        }
      }

      // Utility Classes
      const classes = extractUtilityClasses(content);
      results.utilityClasses.total += classes.length;

      for (const className of classes) {
        // Skip if safelisted
        if (isTokenSafelisted(className)) {
          results.utilityClasses.safelisted.push({
            class: className,
            file: relative(process.cwd(), cssFile),
            reason: 'Protected by safelist'
          });
          continue;
        }

        // Find usage (search for className="..." patterns)
        const { usageCount } = findUsageInFiles(className, SRC_DIR);

        if (usageCount === 0) {
          results.utilityClasses.unused.push({
            class: className,
            file: relative(process.cwd(), cssFile),
            confidence: 'MEDIUM',  // Lower confidence for classes
            recommendation: 'REVIEW_BEFORE_REMOVE'
          });
        }
      }
    } catch (error) {
      console.error(`Error analyzing ${cssFile}:`, error.message);
    }
  }

  // Write results
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  console.log('📊 CSS Token Analysis Results:');
  console.log(`   Variables total: ${results.variables.total}`);
  console.log(`   Variables unused: ${results.variables.unused.length}`);
  console.log(`   Variables safelisted: ${results.variables.safelisted.length}`);
  console.log(`   Utility classes total: ${results.utilityClasses.total}`);
  console.log(`   Utility classes unused: ${results.utilityClasses.unused.length}`);
  console.log(`   Utility classes safelisted: ${results.utilityClasses.safelisted.length}`);
  console.log(`\n✅ Results saved to: ${RESULTS_FILE}\n`);

  return results;
}

// Run analysis
analyzeCSSTokens().catch(console.error);
```

### 3.2 Execute CSS Analysis

```bash
node scripts/deadcode/scan-css-tokens.mjs
```

---

## 🖼️ Phase 4: Asset Analysis (20 min)

### 4.1 Unused Image Asset Scanner

Create **`scripts/deadcode/scan-assets.mjs`**:

```javascript
#!/usr/bin/env node
/**
 * CORIA Deadcode Audit - Asset Scanner
 * Finds unused images and SVG files
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative, basename } from 'path';
import { SAFELIST } from './safelist.ts';

const PUBLIC_DIR = './public';
const SRC_DIR = './src';
const RESULTS_FILE = './docs/ui/audit-results/unused-assets.json';

// Find all image assets
function findAllAssets(dir) {
  const assets = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.')) {
      assets.push(...findAllAssets(fullPath));
    } else if (/\.(svg|png|jpg|jpeg|webp|gif)$/i.test(item)) {
      assets.push(fullPath);
    }
  }

  return assets;
}

// Check if asset is referenced in codebase
function findAssetReferences(assetPath, srcDir) {
  const assetName = basename(assetPath);
  const assetNameWithoutExt = assetName.replace(/\.[^.]+$/, '');
  let referenceCount = 0;
  const referenceLocations = [];

  function searchDirectory(dirPath) {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        searchDirectory(fullPath);
      } else if (/\.(tsx?|css|json)$/i.test(item)) {
        const content = readFileSync(fullPath, 'utf-8');

        // Search patterns
        const patterns = [
          new RegExp(assetName, 'gi'),
          new RegExp(assetNameWithoutExt, 'gi'),
          new RegExp(`src=["'][^"']*${assetName}["']`, 'gi'),
          new RegExp(`url\\([^)]*${assetName}[^)]*\\)`, 'gi'),
        ];

        for (const pattern of patterns) {
          const matches = content.match(pattern);
          if (matches) {
            referenceCount += matches.length;
            if (!referenceLocations.some(loc => loc.file === fullPath)) {
              referenceLocations.push({
                file: relative(process.cwd(), fullPath),
                count: matches.length
              });
            }
          }
        }
      }
    }
  }

  searchDirectory(srcDir);
  return { referenceCount, referenceLocations };
}

// Check if asset is protected
function isAssetProtected(assetPath) {
  return SAFELIST.protectedAssets.some(pattern => {
    if (typeof pattern === 'string') {
      return assetPath.includes(pattern.replace('public/', ''));
    }
    return pattern.test(assetPath);
  });
}

// Main analysis
async function analyzeAssets() {
  console.log('🖼️  Scanning image assets...\n');

  const assets = findAllAssets(PUBLIC_DIR);
  console.log(`Found ${assets.length} image assets\n`);

  const results = {
    totalAssets: assets.length,
    unusedAssets: [],
    protectedAssets: [],
    analyzedAt: new Date().toISOString(),
  };

  for (const asset of assets) {
    const relativePath = relative(process.cwd(), asset);
    const stat = statSync(asset);

    // Skip if protected
    if (isAssetProtected(relativePath)) {
      results.protectedAssets.push({
        file: relativePath,
        size: `${(stat.size / 1024).toFixed(2)} KB`,
        reason: 'Protected by safelist'
      });
      continue;
    }

    // Find references
    const { referenceCount, referenceLocations } = findAssetReferences(asset, SRC_DIR);

    if (referenceCount === 0) {
      results.unusedAssets.push({
        file: relativePath,
        size: `${(stat.size / 1024).toFixed(2)} KB`,
        confidence: 'HIGH',
        recommendation: 'SAFE_TO_DELETE',
        references: referenceLocations
      });
    }
  }

  // Write results
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  console.log('📊 Asset Analysis Results:');
  console.log(`   Total assets: ${results.totalAssets}`);
  console.log(`   Unused assets: ${results.unusedAssets.length}`);
  console.log(`   Protected assets: ${results.protectedAssets.length}`);

  // Calculate potential space savings
  const totalUnusedSize = results.unusedAssets.reduce((sum, asset) => {
    return sum + parseFloat(asset.size);
  }, 0);
  console.log(`   Potential space savings: ${totalUnusedSize.toFixed(2)} KB`);
  console.log(`\n✅ Results saved to: ${RESULTS_FILE}\n`);

  return results;
}

// Run analysis
analyzeAssets().catch(console.error);
```

### 4.2 Execute Asset Analysis

```bash
node scripts/deadcode/scan-assets.mjs
```

---

## 🔄 Phase 5: Component Duplication Detection (30 min)

### 5.1 Manual Component Review Checklist

**Audit Areas**:

1. **Background Components**:
   - ✅ `BrandBackground.tsx` (NEW - Keep)
   - ⚠️  Check for any old gradient/background components
   - Look for: `*gradient*.tsx`, `*background*.tsx` in `/components`

2. **Button Components**:
   - Check for multiple button implementations with same functionality
   - Look in: `/components/ui/button.tsx`, `/components/ui/cta-button.tsx`, etc.

3. **Card Components**:
   - Identify any duplicate card patterns
   - Look in: `/components/ui/card.tsx`, `/components/sections/*-card.tsx`

4. **Form Components**:
   - Check for duplicate form input/validation components
   - Look in: `/components/ui/input.tsx`, `/components/contact/`, `/components/foundation/`

5. **Icon Components**:
   - Verify no duplicate icon implementations outside Icon System v1.0
   - Icon System is in `/components/icons/` - everything else should use it

### 5.2 Component Duplication Scan Command

```bash
# Find potentially duplicate component files
cd /Users/burakcemyaman/PROJECTS/CORIA-APP/coria_app/website

# Search for duplicate button patterns
find src/components -name "*button*.tsx" -type f

# Search for duplicate card patterns
find src/components -name "*card*.tsx" -type f

# Search for old background/gradient components
find src/components -name "*background*.tsx" -o -name "*gradient*.tsx" -type f

# Search for duplicate form components
find src/components -name "*form*.tsx" -o -name "*input*.tsx" -type f
```

### 5.3 Duplication Analysis Template

Create **`docs/ui/audit-results/component-duplicates.md`**:

```markdown
# Component Duplication Audit Results

## Background Components

### Active Component
- ✅ `src/components/ui/BrandBackground.tsx` (Icon System v1.0 compliant)

### Potential Duplicates
- [ ] None found

---

## Button Components

### Active Components
- [ ] List all button components found
- [ ] Mark which are duplicates vs. intentionally different

### Recommended Actions
- [ ] Consolidate duplicate buttons into single component with variants
- [ ] Or: Document why multiple implementations are needed

---

## Card Components

### Active Components
- [ ] List all card components found

### Recommended Actions
- [ ] TBD

---

## Form Components

### Active Components
- [ ] List all form components found

### Recommended Actions
- [ ] TBD
```

---

## 📝 Phase 6: Generate Comprehensive Audit Report (15 min)

### 6.1 Consolidated Audit Report

Create **`docs/ui/Deadcode_Audit.md`**:

```markdown
# CORIA Website Deadcode Audit Report

**Generated**: {timestamp}
**Auditor**: Automated scan with manual review
**Status**: Dry-run completed, awaiting approval

---

## 📊 Executive Summary

### Totals
- **TypeScript Exports**: {totalExports} analyzed, {unusedExports} unused
- **CSS Tokens**: {totalVariables} variables, {unusedVariables} unused
- **CSS Utilities**: {totalClasses} classes, {unusedClasses} unused
- **Image Assets**: {totalAssets} files, {unusedAssets} unused ({totalSize} KB)
- **Component Duplicates**: {duplicateCount} identified

### Safety Classification
- ✅ **HIGH CONFIDENCE** (Safe to remove): {highConfidenceCount} items
- ⚠️  **MEDIUM CONFIDENCE** (Review before remove): {mediumConfidenceCount} items
- 🔒 **PROTECTED** (Safelisted): {safelistedCount} items

---

## 🗑️ Unused TypeScript Exports

### Safe to Remove (HIGH CONFIDENCE)

#### Components
```typescript
// {file}:{line}
export const UnusedComponent = () => { /* ... */ }
```

#### Utilities
```typescript
// {file}:{line}
export function unusedUtility() { /* ... */ }
```

#### Types
```typescript
// {file}:{line}
export interface UnusedInterface { /* ... */ }
```

---

## 🎨 Unused CSS Tokens

### CSS Variables (Safe to Remove)

```css
/* {file} */
:root {
  --unused-variable-1: #FFFFFF; /* 0 references */
  --unused-variable-2: 16px;    /* 0 references */
}
```

### Utility Classes (Review Before Remove)

```css
/* {file} */
.unused-utility-class {
  /* 0 references - MEDIUM confidence */
}
```

---

## 🖼️ Unused Assets

### Images (Safe to Delete)

| File | Size | Confidence | Action |
|------|------|------------|--------|
| `public/unused-image.png` | 125 KB | HIGH | DELETE |
| `public/old-background.svg` | 45 KB | HIGH | DELETE |

**Total Savings**: {totalSavings} KB

---

## 🔄 Component Duplicates

### Background Components
- ❌ `old-background-component.tsx` - Replaced by BrandBackground.tsx
- **Action**: Remove after verifying BrandBackground usage

### Button Components
- ⚠️  Multiple button implementations found
- **Action**: Consolidate or document intentional differences

---

## 🛡️ Protected Items (Safelist)

### Icon System v1.0
- 🔒 ALL icons in `icons-map.ts` are protected
- 🔒 Dynamic icon name patterns protected
- Total: {iconCount} icon components

### Critical Styles
- 🔒 BrandBackground CSS variables
- 🔒 Core color tokens
- 🔒 Layout utilities
- Total: {styleCount} protected tokens

### Protected Assets
- 🔒 `leaf-vein.svg` (BrandBackground overlay)
- 🔒 `coria-app-logo.svg` (Brand logo)
- 🔒 Favicon variants
- Total: {assetCount} protected files

---

## 📋 Removal Workflow

### Step 1: Review JSON Results
```bash
cat docs/ui/audit-results/unused-exports.json
cat docs/ui/audit-results/unused-css-tokens.json
cat docs/ui/audit-results/unused-assets.json
```

### Step 2: Generate Dry-Run Patch
```bash
bash scripts/deadcode/generate-removal-patch.sh
```

### Step 3: Review Patch
```bash
cat deadcode_dryrun.patch
```

### Step 4: Apply (if approved)
```bash
# Create backup first
git checkout -b deadcode-removal-backup
git add .
git commit -m "backup: Before deadcode removal"

# Apply patch
git apply deadcode_dryrun.patch

# Test
npm run build
npm run test
```

### Step 5: Cleanup
```bash
# If successful
git checkout main
git branch -D deadcode-removal-backup

# If issues found
git checkout deadcode-removal-backup
git branch -D deadcode-removal  # Discard changes
```

---

## ⚠️ Risk Assessment

### Low Risk (Safe to remove immediately)
- Unused exports with 0 imports
- Unused CSS variables with 0 var() references
- Unused assets with 0 src/url references

### Medium Risk (Review before removing)
- Utility classes (may be used dynamically)
- Exports from index files (may be library interfaces)
- Assets in nested directories (may be referenced dynamically)

### High Risk (DO NOT REMOVE)
- Anything in safelist
- Dynamic icon names
- I18n translation keys
- BrandBackground system

---

## 📈 Impact Assessment

### Bundle Size Reduction (Estimated)
- **TypeScript**: ~{tsSize} KB (unused exports tree-shaken)
- **CSS**: ~{cssSize} KB (unused tokens removed)
- **Assets**: ~{assetSize} KB (unused images deleted)
- **Total**: ~{totalSize} KB reduction

### Maintenance Benefits
- Reduced codebase complexity
- Fewer files to maintain
- Clearer component architecture
- Easier onboarding for new developers

---

## ✅ Next Steps

1. [ ] Review this audit report
2. [ ] Verify high-confidence removals are safe
3. [ ] Check medium-confidence items manually
4. [ ] Generate dry-run patch
5. [ ] Test patch in isolated branch
6. [ ] Apply if tests pass
7. [ ] Monitor for any runtime issues
8. [ ] Document lessons learned

---

**Audit Completed**: {timestamp}
**Estimated Time to Review**: 30-45 minutes
**Estimated Time to Apply**: 15-30 minutes
**Total Audit + Cleanup Time**: 2-3 hours
```

---

## 🔧 Phase 7: Generate Dry-Run Patch (20 min)

### 7.1 Patch Generation Script

Create **`scripts/deadcode/generate-removal-patch.sh`**:

```bash
#!/bin/bash
# CORIA Deadcode Removal - Dry-Run Patch Generator
# Generates a git patch file for manual review

set -e

PATCH_FILE="./deadcode_dryrun.patch"
RESULTS_DIR="./docs/ui/audit-results"

echo "🔧 Generating deadcode removal patch..."
echo ""

# Create temporary branch for changes
git checkout -b deadcode-removal-temp

# Parse JSON results and generate removals
# (This is a template - actual implementation would parse JSON files)

# Example: Remove unused exports
# while read -r file line symbol; do
#   # Use sed or similar to remove the export
#   echo "Removing $symbol from $file:$line"
# done < <(jq -r '.unusedExports[] | "\(.file) \(.line) \(.symbol)"' "$RESULTS_DIR/unused-exports.json")

# Example: Remove unused CSS tokens
# while read -r file token; do
#   echo "Removing $token from $file"
#   # Use sed to remove the CSS variable or class
# done < <(jq -r '.variables.unused[] | "\(.file) \(.token)"' "$RESULTS_DIR/unused-css-tokens.json")

# Example: Delete unused assets
# while read -r file; do
#   echo "Deleting $file"
#   # rm "$file"
# done < <(jq -r '.unusedAssets[].file' "$RESULTS_DIR/unused-assets.json")

# Commit changes
git add .
git commit -m "chore: Remove deadcode (dry-run)"

# Generate patch
git format-patch main --stdout > "$PATCH_FILE"

# Return to main branch
git checkout main
git branch -D deadcode-removal-temp

echo ""
echo "✅ Patch generated: $PATCH_FILE"
echo "Review the patch before applying:"
echo "   cat $PATCH_FILE"
echo ""
echo "To apply the patch:"
echo "   git apply $PATCH_FILE"
echo ""
```

### 7.2 Make Script Executable

```bash
chmod +x scripts/deadcode/generate-removal-patch.sh
```

---

## 🎯 Phase 8: Final Review & Approval (30 min)

### 8.1 Review Checklist

```markdown
## Pre-Approval Checklist

### Audit Results Review
- [ ] Read complete audit report
- [ ] Verify HIGH confidence items are genuinely unused
- [ ] Manually check MEDIUM confidence items
- [ ] Confirm all protected items are in safelist
- [ ] Check for any false positives

### Patch Review
- [ ] Generate dry-run patch
- [ ] Review patch file line-by-line
- [ ] Verify no protected items in patch
- [ ] Check for any risky removals
- [ ] Ensure patch is reversible

### Testing Plan
- [ ] Create backup branch
- [ ] Apply patch in isolated environment
- [ ] Run `npm run build` - must succeed
- [ ] Run `npm run test` - all tests pass
- [ ] Run `npm run lint` - no new errors
- [ ] Manual UI smoke test - all pages load
- [ ] Check console for errors
- [ ] Verify icon system still works
- [ ] Verify BrandBackground renders

### Rollback Plan
- [ ] Document current git commit hash
- [ ] Keep backup branch for 1 week
- [ ] Have revert command ready
- [ ] Monitor production after deploy

---

## Approval Decision

**Status**: [ ] APPROVED / [ ] REJECTED / [ ] NEEDS CHANGES

**Approved By**: _____________
**Date**: _____________
**Notes**: _____________

---

## Post-Deployment Monitoring

### Week 1 After Deployment
- [ ] Monitor error tracking for new issues
- [ ] Check performance metrics
- [ ] Verify bundle size reduction
- [ ] User testing feedback
- [ ] No rollback required

### Cleanup After Success
- [ ] Delete backup branch
- [ ] Archive audit results
- [ ] Update documentation
- [ ] Document lessons learned
```

---

## 📚 Appendix: Quick Reference Commands

### Generate All Audit Reports
```bash
# Run all audit scripts
node scripts/deadcode/scan-exports.mjs
node scripts/deadcode/scan-css-tokens.mjs
node scripts/deadcode/scan-assets.mjs

# Generate consolidated report
cat docs/ui/audit-results/*.json > docs/ui/audit-results/consolidated.json
```

### Review Results
```bash
# View JSON results
cat docs/ui/audit-results/unused-exports.json | jq '.unusedExports | length'
cat docs/ui/audit-results/unused-css-tokens.json | jq '.variables.unused | length'
cat docs/ui/audit-results/unused-assets.json | jq '.unusedAssets | length'
```

### Generate Patch
```bash
bash scripts/deadcode/generate-removal-patch.sh
```

### Test Patch (Safe)
```bash
# Create test branch
git checkout -b test-deadcode-removal

# Apply patch
git apply deadcode_dryrun.patch

# Test
npm run build && npm run test

# If successful, merge
git checkout main
git merge test-deadcode-removal

# If failed, discard
git checkout main
git branch -D test-deadcode-removal
```

---

## 🚨 Emergency Rollback

If issues are detected after deployment:

```bash
# Option 1: Revert the merge commit
git revert -m 1 <merge-commit-hash>

# Option 2: Hard reset to before patch
git reset --hard <commit-hash-before-patch>
git push origin main --force

# Option 3: Restore from backup branch
git checkout deadcode-removal-backup
git checkout -b main-restored
git branch -D main
git branch -m main
git push origin main --force
```

---

## 📊 Success Metrics

After successful deployment, measure:

1. **Bundle Size Reduction**: Compare before/after build sizes
2. **Build Time**: Check if builds are faster
3. **Code Complexity**: Fewer files = easier maintenance
4. **No Regressions**: All features work as before
5. **Developer Experience**: Easier to navigate codebase

---

**Workflow Complete** ✅

This workflow is now ready for execution. All scripts are templates that need to be implemented based on your specific codebase structure.
