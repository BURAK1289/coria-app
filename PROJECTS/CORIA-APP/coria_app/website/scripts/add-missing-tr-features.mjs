#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messagesDir = path.join(__dirname, '../src/messages');

// Missing TR translations (new features)
const missingTrFeatures = {
  sustainabilityInsights: {
    title: "Sürdürülebilirlik İçgörüleri",
    description: "Detaylı analitiklerle çevresel etkinizi takip edin"
  },
  socialCommitment: {
    title: "Sosyal Sorumluluk",
    description: "Etik uygulamalar ve sosyal sorumluluk sahibi markaları destekleyin"
  }
};

console.log('📝 Adding missing TR feature translations...\n');

// Read TR file
const trPath = path.join(messagesDir, 'tr.json');
const trContent = JSON.parse(fs.readFileSync(trPath, 'utf8'));

// Add missing features
Object.entries(missingTrFeatures).forEach(([key, value]) => {
  if (!trContent.features[key]) {
    trContent.features[key] = value;
    console.log(`✅ Added features.${key}.title and .description`);
  } else {
    console.log(`⏭️  features.${key} already exists`);
  }
});

// Write back to file
fs.writeFileSync(trPath, JSON.stringify(trContent, null, 2) + '\n', 'utf8');

console.log('\n✅ TR feature translations complete!');
console.log('\nAdded keys:');
Object.keys(missingTrFeatures).forEach(key => {
  console.log(`  - features.${key}.title`);
  console.log(`  - features.${key}.description`);
});
