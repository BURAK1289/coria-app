#!/usr/bin/env node
/**
 * CORIA Deadcode Audit Phase 2 - CSS Token Scanner
 * HIGH CONFIDENCE labeling for CSS variable removal
 *
 * Usage: node scripts/deadcode/scan-css-tokens.mjs
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
  // BrandBackground System - PROTECTED
  brandBackground: [
    '--cream-50', '--cream-100', '--cream-200', '--cream-300',
    '--foam', '--mist', '--forest', '--leaf', '--lime',
  ],

  // Core CORIA Colors - PROTECTED
  coriaColors: [
    '--coria-green', '--coria-primary', '--earth', '--sky', '--coral', '--gold',
  ],

  // Animation/Transition Tokens - PROTECTED
  transitions: [
    '--transition-organic', '--transition-bounce',
    '--ease-out-cubic', '--ease-in-out-quart',
  ],

  // Pattern matching for dynamic usage
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
    try {
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
            // Check for var(--token) usage or direct token reference
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
    } catch (error) {
      // Skip directories we can't read
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
      console.log(`   Scanning ${cssFile}...`);
      const content = readFileSync(cssFile, 'utf-8');
      const variables = extractCSSVariables(content, cssFile);
      results.variables.total += variables.length;

      console.log(`   Found ${variables.length} variables in ${cssFile}`);

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
      console.error(`   ❌ Error analyzing ${cssFile}:`, error.message);
    }
  }

  // Calculate summary
  results.summary.total_variables = results.variables.total;
  results.summary.high_confidence_removal_candidates = results.variables.high_confidence_unused.length;
  results.summary.medium_confidence_review_needed = results.variables.medium_confidence_unused.length;
  results.summary.protected_variables = results.variables.protected.length;

  // Estimate CSS size reduction (rough: 50 bytes per variable definition)
  results.summary.estimated_css_size_reduction_kb =
    ((results.summary.high_confidence_removal_candidates * 50 +
     results.summary.medium_confidence_review_needed * 50) / 1024).toFixed(2);

  // Write results
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  console.log('\n📊 CSS Token Analysis Results:');
  console.log(`   Total variables: ${results.summary.total_variables}`);
  console.log(`   🟢 HIGH confidence (safe to remove): ${results.summary.high_confidence_removal_candidates}`);
  console.log(`   🟡 MEDIUM confidence (review needed): ${results.summary.medium_confidence_review_needed}`);
  console.log(`   🔴 PROTECTED (safelist): ${results.summary.protected_variables}`);
  console.log(`   Estimated size reduction: ${results.summary.estimated_css_size_reduction_kb} KB`);
  console.log(`\n✅ Results saved to: ${RESULTS_FILE}\n`);

  return results;
}

// === RUN ANALYSIS ===

analyzeCSSTokens().catch(console.error);
