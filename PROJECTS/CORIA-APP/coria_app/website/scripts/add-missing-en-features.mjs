#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messagesDir = path.join(__dirname, '../src/messages');

// Missing EN translations (professional translations from TR source)
const missingEnFeatures = {
  barcodeScan: {
    title: "Barcode Scanning",
    description: "Instantly discover product sustainability scores"
  },
  aiRecommendations: {
    title: "AI Recommendations",
    description: "Get personalized sustainable product recommendations"
  },
  sustainabilityInsights: {
    title: "Sustainability Insights",
    description: "Track your environmental impact with detailed analytics"
  },
  socialCommitment: {
    title: "Social Commitment",
    description: "Support brands with ethical practices and social responsibility"
  }
};

console.log('📝 Adding missing EN feature translations...\n');

// Read EN file
const enPath = path.join(messagesDir, 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Add missing features
Object.entries(missingEnFeatures).forEach(([key, value]) => {
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
console.log('\nAdded keys:');
Object.keys(missingEnFeatures).forEach(key => {
  console.log(`  - features.${key}.title`);
  console.log(`  - features.${key}.description`);
});
