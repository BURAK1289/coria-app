#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messagesDir = path.join(__dirname, '../src/messages');

// Read all locale files
const tr = JSON.parse(fs.readFileSync(path.join(messagesDir, 'tr.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'));
const de = JSON.parse(fs.readFileSync(path.join(messagesDir, 'de.json'), 'utf8'));
const fr = JSON.parse(fs.readFileSync(path.join(messagesDir, 'fr.json'), 'utf8'));

// Function to get all keys recursively
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Function to get value by key path
function getByPath(obj, path) {
  return path.split('.').reduce((curr, key) => curr?.[key], obj);
}

// Get all keys from TR (baseline)
const trKeys = getAllKeys(tr);

// Find missing keys
function findMissingKeys(targetLocale, localeName) {
  const missing = [];
  const missingWithTranslations = [];

  for (const key of trKeys) {
    const value = getByPath(targetLocale, key);
    if (value === undefined || value === null) {
      const trValue = getByPath(tr, key);
      const enValue = getByPath(en, key);
      missing.push(key);
      missingWithTranslations.push({
        key,
        tr: trValue,
        en: enValue
      });
    }
  }

  return { missing, missingWithTranslations };
}

// Generate missing keys for DE and FR
const deMissing = findMissingKeys(de, 'DE');
const frMissing = findMissingKeys(fr, 'FR');

console.log(`\n📊 Missing Keys Statistics:\n`);
console.log(`DE Missing: ${deMissing.missing.length} keys`);
console.log(`FR Missing: ${frMissing.missing.length} keys`);

// Save missing keys lists
const outputDir = path.join(__dirname, '../docs/ui');
fs.mkdirSync(outputDir, { recursive: true });

// Save DE missing keys with translations
fs.writeFileSync(
  path.join(outputDir, 'I18N_Translation_Missing_DE.json'),
  JSON.stringify({
    locale: 'de',
    totalMissing: deMissing.missing.length,
    missingKeys: deMissing.missing,
    translations: deMissing.missingWithTranslations
  }, null, 2) + '\n',
  'utf8'
);

// Save FR missing keys with translations
fs.writeFileSync(
  path.join(outputDir, 'I18N_Translation_Missing_FR.json'),
  JSON.stringify({
    locale: 'fr',
    totalMissing: frMissing.missing.length,
    missingKeys: frMissing.missing,
    translations: frMissing.missingWithTranslations
  }, null, 2) + '\n',
  'utf8'
);

console.log(`\n✅ Generated missing keys files:`);
console.log(`   - docs/ui/I18N_Translation_Missing_DE.json`);
console.log(`   - docs/ui/I18N_Translation_Missing_FR.json\n`);
