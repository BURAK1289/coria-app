#!/usr/bin/env node
/**
 * Merge generated locale keys into existing locale files
 * This script performs a deep merge of 233 new keys into the existing 589 keys
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const websiteRoot = join(__dirname, '..');

// Locales to process
const LOCALES = ['tr', 'en', 'de', 'fr'];

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object to merge
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(output[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
}

/**
 * Count keys in an object recursively
 * @param {Object} obj - Object to count keys from
 * @returns {number} Total key count
 */
function countKeys(obj) {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      count += countKeys(obj[key]);
    } else {
      count++;
    }
  }
  return count;
}

/**
 * Merge locale files for a specific locale
 * @param {string} locale - Locale code (tr, en, de, fr)
 */
function mergeLocaleFile(locale) {
  console.log(`\n📋 Processing ${locale.toUpperCase()} locale...`);
  
  // Read existing locale file
  const existingPath = join(websiteRoot, 'src', 'messages', `${locale}.json`);
  const existingContent = readFileSync(existingPath, 'utf8');
  const existingData = JSON.parse(existingContent);
  const existingCount = countKeys(existingData);
  
  console.log(`   ✓ Existing keys: ${existingCount}`);
  
  // Read generated updates file
  const updatesPath = join(websiteRoot, 'docs', 'ui', `locale-updates-${locale}.json`);
  const updatesContent = readFileSync(updatesPath, 'utf8');
  const updatesData = JSON.parse(updatesContent);
  const updatesCount = countKeys(updatesData);
  
  console.log(`   ✓ New keys to add: ${updatesCount}`);
  
  // Deep merge
  const mergedData = deepMerge(existingData, updatesData);
  const mergedCount = countKeys(mergedData);
  
  console.log(`   ✓ Total keys after merge: ${mergedCount}`);
  
  // Write merged data back
  const mergedJson = JSON.stringify(mergedData, null, 2);
  writeFileSync(existingPath, mergedJson + '\n', 'utf8');
  
  console.log(`   ✅ Successfully merged ${locale}.json`);
  
  return {
    locale,
    existingCount,
    updatesCount,
    mergedCount,
    addedKeys: mergedCount - existingCount
  };
}

// Main execution
console.log('🚀 Starting locale file merge operation...\n');
console.log('=' .repeat(60));

const results = [];

try {
  for (const locale of LOCALES) {
    const result = mergeLocaleFile(locale);
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 MERGE SUMMARY\n');
  
  results.forEach(result => {
    console.log(`${result.locale.toUpperCase()}:`);
    console.log(`  Before: ${result.existingCount} keys`);
    console.log(`  After:  ${result.mergedCount} keys`);
    console.log(`  Added:  ${result.addedKeys} keys`);
    console.log();
  });
  
  console.log('✅ All locale files merged successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Review merged files in src/messages/');
  console.log('   2. Translate [DE] and [FR] placeholder keys');
  console.log('   3. Run: npm run i18n:validate');
  console.log('   4. Begin code migration with generated map');
  
} catch (error) {
  console.error('\n❌ Error during merge:', error.message);
  console.error(error.stack);
  process.exit(1);
}
