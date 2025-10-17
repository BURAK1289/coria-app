#!/usr/bin/env node
/**
 * CORIA Deadcode Audit Phase 2 - Asset Scanner
 * HIGH CONFIDENCE labeling for unused image/SVG deletion
 *
 * Usage: node scripts/deadcode/scan-assets.mjs
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative, basename } from 'path';

// === CONFIGURATION ===

const PUBLIC_DIR = './public';
const SRC_DIR = './src';
const RESULTS_FILE = './docs/ui/audit-results/unused-assets.json';

// === SAFELIST ===

const ASSET_SAFELIST = {
  // Brand Assets - PROTECTED
  brandAssets: [
    'leaf-vein.svg',
    'coria-app-logo.svg',
    'logo.svg',
  ],

  // PWA Icons - PROTECTED (pattern matching)
  pwaIcons: [
    /^icon-\d+x\d+\.png$/,
    /^apple-touch-icon.*\.png$/,
    /^favicon.*\.(png|ico)$/,
  ],
};

// === UTILITY FUNCTIONS ===

function findAllAssets(dir) {
  const assets = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.')) {
        assets.push(...findAllAssets(fullPath));
      } else if (/\.(svg|png|jpg|jpeg|webp|gif)$/i.test(item)) {
        assets.push({
          path: fullPath,
          name: item,
          size: stat.size,
          lastModified: stat.mtime,
        });
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return assets;
}

function isAssetProtected(assetName) {
  // Check direct safelist
  if (ASSET_SAFELIST.brandAssets.includes(assetName)) {
    return { protected: true, reason: 'Brand asset safelist' };
  }

  // Check pattern matching
  for (const pattern of ASSET_SAFELIST.pwaIcons) {
    if (pattern.test(assetName)) {
      return { protected: true, reason: 'PWA icon pattern' };
    }
  }

  return { protected: false };
}

function findAssetReferences(asset, searchDir) {
  const references = [];
  const assetName = basename(asset.path);
  const assetNameWithoutExt = assetName.replace(/\.[^.]+$/, '');

  function searchDirectory(dirPath) {
    try {
      const items = readdirSync(dirPath);

      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          searchDirectory(fullPath);
        } else if (/\.(tsx?|css|json)$/.test(item)) {
          const content = readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');

          lines.forEach((line, index) => {
            // Check multiple patterns
            if (
              line.includes(assetName) ||
              line.includes(assetNameWithoutExt) ||
              (/src=["'][^"']*/.test(line) && line.includes(assetName)) ||
              (/url\([^)]*/.test(line) && line.includes(assetName))
            ) {
              references.push({
                file: relative(process.cwd(), fullPath),
                line: index + 1,
                usage: line.trim().substring(0, 80),
              });
            }
          });
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  searchDirectory(searchDir);
  return references;
}

// === MAIN ANALYSIS ===

async function analyzeAssets() {
  console.log('🖼️  Phase 2: Asset Analysis with HIGH CONFIDENCE Labeling\n');

  const assets = findAllAssets(PUBLIC_DIR);
  console.log(`   Found ${assets.length} image assets\n`);

  const results = {
    assets: {
      total: assets.length,
      high_confidence_unused: [],
      medium_confidence_unused: [],
      protected: [],
    },
    summary: {
      total_assets: assets.length,
      high_confidence_removal_candidates: 0,
      medium_confidence_review_needed: 0,
      protected_assets: 0,
      estimated_space_savings_kb: 0,
      estimated_space_savings_mb: 0,
    },
    analyzed_at: new Date().toISOString(),
  };

  for (const asset of assets) {
    const protectionStatus = isAssetProtected(asset.name);

    // Skip protected assets
    if (protectionStatus.protected) {
      results.assets.protected.push({
        file: relative(process.cwd(), asset.path),
        size_kb: (asset.size / 1024).toFixed(2),
        confidence: 'PROTECTED',
        reason: protectionStatus.reason,
        recommendation: 'DO_NOT_DELETE',
      });
      continue;
    }

    // Find references
    const references = findAssetReferences(asset, SRC_DIR);
    const referenceCount = references.length;

    const assetInfo = {
      file: relative(process.cwd(), asset.path),
      size_kb: parseFloat((asset.size / 1024).toFixed(2)),
      references: referenceCount,
      last_modified: asset.lastModified.toISOString(),
    };

    if (referenceCount === 0) {
      assetInfo.confidence = 'HIGH';
      assetInfo.recommendation = 'SAFE_TO_DELETE';
      assetInfo.reason = '0 references found';
      results.assets.high_confidence_unused.push(assetInfo);
    } else if (referenceCount <= 2) {
      assetInfo.confidence = 'MEDIUM';
      assetInfo.recommendation = 'REVIEW_BEFORE_DELETE';
      assetInfo.reason = `${referenceCount} references found`;
      assetInfo.reference_locations = references;
      results.assets.medium_confidence_unused.push(assetInfo);
    }
  }

  // Calculate summary
  results.summary.high_confidence_removal_candidates = results.assets.high_confidence_unused.length;
  results.summary.medium_confidence_review_needed = results.assets.medium_confidence_unused.length;
  results.summary.protected_assets = results.assets.protected.length;

  // Calculate space savings
  const highConfidenceSavings = results.assets.high_confidence_unused.reduce((sum, a) => sum + a.size_kb, 0);
  const mediumConfidenceSavings = results.assets.medium_confidence_unused.reduce((sum, a) => sum + a.size_kb, 0);
  results.summary.estimated_space_savings_kb = (highConfidenceSavings + mediumConfidenceSavings).toFixed(2);
  results.summary.estimated_space_savings_mb = (results.summary.estimated_space_savings_kb / 1024).toFixed(2);

  // Write results
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  console.log('📊 Asset Analysis Results:');
  console.log(`   Total assets: ${results.summary.total_assets}`);
  console.log(`   🟢 HIGH confidence (safe to delete): ${results.summary.high_confidence_removal_candidates}`);
  console.log(`   🟡 MEDIUM confidence (review needed): ${results.summary.medium_confidence_review_needed}`);
  console.log(`   🔴 PROTECTED (safelist): ${results.summary.protected_assets}`);
  console.log(`   Estimated space savings: ${results.summary.estimated_space_savings_mb} MB`);
  console.log(`\n✅ Results saved to: ${RESULTS_FILE}\n`);

  return results;
}

// === RUN ANALYSIS ===

analyzeAssets().catch(console.error);
