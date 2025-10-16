#!/usr/bin/env node
/**
 * Convert logo.svg to optimized logo.webp
 * Target: 512px width, quality ~85, WebP format
 * Reduces 11MB SVG to ~50-100KB WebP
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const INPUT_PATH = join(projectRoot, 'public', 'logo.svg');
const OUTPUT_PATH = join(projectRoot, 'public', 'logo.webp');
const TARGET_WIDTH = 512;
const QUALITY = 85;

async function convertLogoToWebP() {
  console.log('🎨 Converting logo.svg to optimized WebP format...');
  console.log(`📁 Input: ${INPUT_PATH}`);
  console.log(`📁 Output: ${OUTPUT_PATH}`);
  console.log(`🎯 Target: ${TARGET_WIDTH}px width, quality ${QUALITY}`);

  try {
    // Read SVG and convert to WebP
    const svgBuffer = readFileSync(INPUT_PATH);

    const webpBuffer = await sharp(svgBuffer)
      .resize(TARGET_WIDTH, null, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .webp({ quality: QUALITY, alphaQuality: 100 })
      .toBuffer();

    // Get metadata for dimensions
    const metadata = await sharp(webpBuffer).metadata();

    // Write output
    writeFileSync(OUTPUT_PATH, webpBuffer);

    // Get file sizes
    const inputSize = (svgBuffer.length / 1024 / 1024).toFixed(2);
    const outputSize = (webpBuffer.length / 1024).toFixed(2);
    const reduction = ((1 - webpBuffer.length / svgBuffer.length) * 100).toFixed(1);

    console.log('✅ Conversion successful!');
    console.log(`📊 Input size: ${inputSize} MB (SVG)`);
    console.log(`📊 Output size: ${outputSize} KB (WebP)`);
    console.log(`📊 Size reduction: ${reduction}%`);
    console.log(`📐 Dimensions: ${metadata.width}x${metadata.height}px`);
    console.log('');
    console.log('🔍 Next steps:');
    console.log('  1. Update logo references from .svg to .webp');
    console.log('  2. Add width/height attributes for CLS optimization');
    console.log(`  3. Use: width="${metadata.width}" height="${metadata.height}"`);

  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

convertLogoToWebP();
