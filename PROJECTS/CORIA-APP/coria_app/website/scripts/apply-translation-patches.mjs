#!/usr/bin/env node
/**
 * Apply translation patches from I18N_Translation_Patch_de_fr.json to locale files
 * Updates de.json and fr.json with proper translations, removing [DE]/[FR] placeholders
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const websiteRoot = join(__dirname, '..');

console.log('🔧 CORIA Translation Patch Application\n');

// Load patch file
const patchPath = join(websiteRoot, 'docs', 'ui', 'I18N_Translation_Patch_de_fr.json');
const patch = JSON.parse(readFileSync(patchPath, 'utf8'));

// Load locale files
const dePath = join(websiteRoot, 'src', 'messages', 'de.json');
const frPath = join(websiteRoot, 'src', 'messages', 'fr.json');

const de = JSON.parse(readFileSync(dePath, 'utf8'));
const fr = JSON.parse(readFileSync(frPath, 'utf8'));

/**
 * Set nested property by dot notation path
 */
function setNestedProperty(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();

  let current = obj;
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

// Apply DE patches
console.log('🇩🇪 Applying German translations...');
let deCount = 0;
for (const [key, value] of Object.entries(patch.de)) {
  setNestedProperty(de, key, value);
  deCount++;
}

// Apply FR patches
console.log('🇫🇷 Applying French translations...');
let frCount = 0;
for (const [key, value] of Object.entries(patch.fr)) {
  setNestedProperty(fr, key, value);
  frCount++;
}

// Save updated locale files
writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
writeFileSync(frPath, JSON.stringify(fr, null, 2), 'utf8');

console.log(`\n✅ Translation patches applied successfully!`);
console.log(`\n📊 Summary:`);
console.log(`   DE translations applied: ${deCount}`);
console.log(`   FR translations applied: ${frCount}`);
console.log(`   Total: ${deCount + frCount}`);
console.log(`\n📁 Updated files:`);
console.log(`   src/messages/de.json`);
console.log(`   src/messages/fr.json\n`);
