#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messagesDir = path.join(__dirname, '../src/messages');

// Remaining missing EN translations
const remainingEnFeatures = {
  impactTracking: {
    title: "Impact Tracking",
    description: "Monitor your carbon footprint and environmental impact"
  },
  smartPantry: {
    title: "Smart Pantry",
    description: "Reduce food waste and shop smarter"
  }
};

console.log('📝 Adding remaining EN feature translations...\n');

// Read EN file
const enPath = path.join(messagesDir, 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Add missing features
Object.entries(remainingEnFeatures).forEach(([key, value]) => {
  if (!enContent.features[key]) {
    enContent.features[key] = value;
    console.log(`✅ Added features.${key}.title and .description`);
  } else {
    console.log(`⏭️  features.${key} already exists`);
  }
});

// Write back to file
fs.writeFileSync(enPath, JSON.stringify(enContent, null, 2) + '\n', 'utf8');

console.log('\n✅ EN feature translations complete!');
