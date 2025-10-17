#!/usr/bin/env node
/**
 * Check actual translation status after patch application
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const websiteRoot = join(__dirname, '..');

const tr = JSON.parse(readFileSync(join(websiteRoot, 'src', 'messages', 'tr.json'), 'utf8'));
const en = JSON.parse(readFileSync(join(websiteRoot, 'src', 'messages', 'en.json'), 'utf8'));
const de = JSON.parse(readFileSync(join(websiteRoot, 'src', 'messages', 'de.json'), 'utf8'));
const fr = JSON.parse(readFileSync(join(websiteRoot, 'src', 'messages', 'fr.json'), 'utf8'));

function countKeys(obj, prefix = '') {
  let count = 0;
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count += countKeys(obj[key], fullKey);
    } else {
      count++;
    }
  }
  return count;
}

function countPlaceholders(obj, pattern) {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count += countPlaceholders(obj[key], pattern);
    } else if (typeof obj[key] === 'string' && obj[key].startsWith(pattern)) {
      count++;
    }
  }
  return count;
}

console.log('📊 CORIA Translation Status Report');
console.log('════════════════════════════════════════════════════════════\n');

const trKeys = countKeys(tr);
const enKeys = countKeys(en);
const deKeys = countKeys(de);
const frKeys = countKeys(fr);

const dePlaceholders = countPlaceholders(de, '[DE]');
const frPlaceholders = countPlaceholders(fr, '[FR]');

console.log('🌍 Key Counts:');
console.log(`   TR (Baseline): ${trKeys} keys`);
console.log(`   EN: ${enKeys} keys`);
console.log(`   DE: ${deKeys} keys`);
console.log(`   FR: ${frKeys} keys\n`);

console.log('🏷️  Placeholder Status:');
console.log(`   DE: ${dePlaceholders} keys still with [DE] prefix`);
console.log(`   FR: ${frPlaceholders} keys still with [FR] prefix\n`);

const deTranslated = 216 - dePlaceholders;
const frTranslated = 216 - frPlaceholders;

console.log('✅ Translations Applied:');
console.log(`   DE: ${deTranslated} / 216 placeholders removed (${Math.round(deTranslated/216*100)}%)`);
console.log(`   FR: ${frTranslated} / 216 placeholders removed (${Math.round(frTranslated/216*100)}%)\n`);

if (dePlaceholders === 0 && frPlaceholders === 0) {
  console.log('🎉 SUCCESS! All translation placeholders have been resolved!\n');
} else {
  console.log(`⚠️  ${dePlaceholders + frPlaceholders} placeholders still remaining\n`);
}
