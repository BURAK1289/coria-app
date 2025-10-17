#!/usr/bin/env node
/**
 * Extract missing translations from EN/DE/FR locale files
 * Identifies empty values and [DE]/[FR] prefixed strings
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const websiteRoot = join(__dirname, '..');

/**
 * Recursively find keys with specific conditions
 * @param {Object} obj - Object to search
 * @param {string} prefix - Key prefix
 * @param {Function} condition - Condition function
 * @returns {Array} Array of {key, value, path} objects
 */
function findKeys(obj, prefix = '', condition) {
  const results = [];

  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      results.push(...findKeys(value, fullPath, condition));
    } else if (condition(value, fullPath)) {
      results.push({ key: fullPath, value, originalKey: key });
    }
  }

  return results;
}

/**
 * Get value from object by dot path
 * @param {Object} obj - Source object
 * @param {string} path - Dot-separated path
 * @returns {any} Value at path
 */
function getByPath(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

console.log('🔍 Analyzing locale files for missing translations...\n');

// Load all locale files
const tr = JSON.parse(readFileSync(join(websiteRoot, 'src', 'messages', 'tr.json'), 'utf8'));
const en = JSON.parse(readFileSync(join(websiteRoot, 'src', 'messages', 'en.json'), 'utf8'));
const de = JSON.parse(readFileSync(join(websiteRoot, 'src', 'messages', 'de.json'), 'utf8'));
const fr = JSON.parse(readFileSync(join(websiteRoot, 'src', 'messages', 'fr.json'), 'utf8'));

// Find EN empty values
const emptyEN = findKeys(en, '', (value) => value === '' || value === null);
console.log(`📝 Found ${emptyEN.length} empty values in EN`);

// Find DE keys with [DE] prefix
const missingDE = findKeys(de, '', (value) =>
  typeof value === 'string' && value.startsWith('[DE]')
);
console.log(`🇩🇪 Found ${missingDE.length} keys with [DE] prefix`);

// Find FR keys with [FR] prefix
const missingFR = findKeys(fr, '', (value) =>
  typeof value === 'string' && value.startsWith('[FR]')
);
console.log(`🇫🇷 Found ${missingFR.length} keys with [FR] prefix\n`);

// Create extraction report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    emptyEN: emptyEN.length,
    missingDE: missingDE.length,
    missingFR: missingFR.length,
    total: emptyEN.length + missingDE.length + missingFR.length
  },
  translations: {
    en: emptyEN.map(item => ({
      key: item.key,
      currentValue: item.value,
      trSource: getByPath(tr, item.key) || '[TR MISSING]',
      enSource: getByPath(en, item.key) || '[EN MISSING]'
    })),
    de: missingDE.map(item => ({
      key: item.key,
      currentValue: item.value,
      trSource: getByPath(tr, item.key) || '[TR MISSING]',
      needsTranslation: true
    })),
    fr: missingFR.map(item => ({
      key: item.key,
      currentValue: item.value,
      trSource: getByPath(tr, item.key) || '[TR MISSING]',
      needsTranslation: true
    }))
  }
};

// Save extraction report
const reportPath = join(websiteRoot, 'docs', 'ui', 'missing-translations-report.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`✅ Extraction report saved to: docs/ui/missing-translations-report.json`);

// Display summary
console.log('\n📊 EXTRACTION SUMMARY\n');
console.log(`EN Empty Values: ${emptyEN.length}`);
if (emptyEN.length > 0) {
  console.log('Keys:');
  emptyEN.slice(0, 5).forEach(item => console.log(`  - ${item.key}`));
  if (emptyEN.length > 5) console.log(`  ... and ${emptyEN.length - 5} more`);
}

console.log(`\nDE Missing Translations: ${missingDE.length}`);
if (missingDE.length > 0) {
  console.log('Sample keys:');
  missingDE.slice(0, 5).forEach(item => console.log(`  - ${item.key}`));
  if (missingDE.length > 5) console.log(`  ... and ${missingDE.length - 5} more`);
}

console.log(`\nFR Missing Translations: ${missingFR.length}`);
if (missingFR.length > 0) {
  console.log('Sample keys:');
  missingFR.slice(0, 5).forEach(item => console.log(`  - ${item.key}`));
  if (missingFR.length > 5) console.log(`  ... and ${missingFR.length - 5} more`);
}

console.log(`\n✅ Analysis complete! Review the report for detailed breakdown.`);
