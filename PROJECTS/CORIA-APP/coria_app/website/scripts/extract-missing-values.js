const fs = require('fs');
const path = require('path');

const tr = require('../src/messages/tr.json');
const missingDE = require('./missing-de-keys.json');

function getValueByPath(obj, keyPath) {
  return keyPath.split('.').reduce((current, key) => {
    if (current === undefined) return undefined;
    // Handle array indices
    if (key.match(/^\d+$/)) {
      return current[parseInt(key)];
    }
    return current[key];
  }, obj);
}

const extractedValues = {};

missingDE.forEach(key => {
  const value = getValueByPath(tr, key);
  if (value !== undefined) {
    extractedValues[key] = value;
  } else {
    console.warn(`⚠️  Key not found in TR: ${key}`);
  }
});

fs.writeFileSync(
  path.join(__dirname, 'missing-tr-values.json'),
  JSON.stringify(extractedValues, null, 2)
);

console.log(`✅ Extracted ${Object.keys(extractedValues).length} Turkish values`);
console.log('   Saved to: scripts/missing-tr-values.json');
