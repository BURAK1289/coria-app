const fs = require('fs');
const path = require('path');

const tr = require('../src/messages/tr.json');
const de = require('../src/messages/de.json');
const fr = require('../src/messages/fr.json');

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix + key;
    const value = obj[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey + '.'));
    } else if (!Array.isArray(value)) {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getValueByPath(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

const trKeys = getAllKeys(tr);
const deKeys = getAllKeys(de);
const frKeys = getAllKeys(fr);

const missingDE = trKeys.filter(k => !deKeys.includes(k));
const missingFR = trKeys.filter(k => !frKeys.includes(k));

console.log('📊 Missing Key Analysis\n');
console.log(`🇩🇪 DE missing: ${missingDE.length} keys`);
console.log(`🇫🇷 FR missing: ${missingFR.length} keys\n`);

// Group by section
const deSections = {};
missingDE.forEach(key => {
  const section = key.split('.')[0];
  deSections[section] = (deSections[section] || 0) + 1;
});

const frSections = {};
missingFR.forEach(key => {
  const section = key.split('.')[0];
  frSections[section] = (frSections[section] || 0) + 1;
});

console.log('🇩🇪 DE Missing by Section:');
Object.entries(deSections).forEach(([section, count]) => {
  console.log(`  ${section}: ${count} keys`);
});

console.log('\n🇫🇷 FR Missing by Section:');
Object.entries(frSections).forEach(([section, count]) => {
  console.log(`  ${section}: ${count} keys`);
});

// Save detailed lists
fs.writeFileSync(
  path.join(__dirname, 'missing-de-keys.json'),
  JSON.stringify(missingDE, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, 'missing-fr-keys.json'),
  JSON.stringify(missingFR, null, 2)
);

console.log('\n✅ Detailed lists saved to:');
console.log('   - scripts/missing-de-keys.json');
console.log('   - scripts/missing-fr-keys.json');
