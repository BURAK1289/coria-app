#!/usr/bin/env node

/**
 * CORIA Icon System - Inventory and Size Check
 *
 * Analyzes the icon system and generates comprehensive reports:
 * - Icon inventory (count, naming, usage)
 * - Bundle size analysis
 * - Missing/unused icons
 * - Migration progress tracking
 *
 * Usage:
 *   npm run icons:check              # Full report
 *   npm run icons:check -- --json    # JSON output
 *   npm run icons:check -- --ci      # CI-friendly output
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const config = {
  iconsDir: path.join(rootDir, 'src', 'components', 'icons'),
  srcDir: path.join(rootDir, 'src'),
  docsDir: path.join(rootDir, 'docs', 'ui'),
};

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  json: args.includes('--json'),
  ci: args.includes('--ci'),
  verbose: args.includes('--verbose') || args.includes('-v'),
};

// Results storage
const results = {
  timestamp: new Date().toISOString(),
  summary: {
    totalIcons: 0,
    totalSize: 0,
    averageSize: 0,
    largestIcon: null,
    smallestIcon: null,
  },
  icons: [],
  usage: {
    used: [],
    unused: [],
    usageCount: {},
  },
  migration: {
    totalFiles: 0,
    migratedFiles: 0,
    remainingFiles: 0,
    progress: 0,
  },
  issues: [],
};

/**
 * Scan icon directory and collect metadata
 */
async function scanIcons() {
  const coreDir = path.join(config.iconsDir, 'svg', 'core');

  try {
    const files = await fs.readdir(coreDir);
    const tsxFiles = files.filter(f => f.endsWith('.tsx') && f !== 'index.ts');

    for (const file of tsxFiles) {
      const filePath = path.join(coreDir, file);
      const stat = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');

      // Extract component name
      const componentMatch = content.match(/export function (\w+Icon)/);
      const componentName = componentMatch ? componentMatch[1] : null;

      // Extract icon name from filename
      const iconName = file.replace('icon-', '').replace('.tsx', '');

      // Extract JSDoc description
      const descMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
      const description = descMatch ? descMatch[1] : '';

      results.icons.push({
        file,
        iconName,
        componentName,
        description,
        size: stat.size,
        path: path.relative(rootDir, filePath),
      });
    }

    results.summary.totalIcons = results.icons.length;

    // Calculate size statistics
    const sizes = results.icons.map(i => i.size);
    results.summary.totalSize = sizes.reduce((a, b) => a + b, 0);
    results.summary.averageSize = Math.round(results.summary.totalSize / sizes.length);

    // Find largest and smallest
    results.icons.sort((a, b) => b.size - a.size);
    results.summary.largestIcon = results.icons[0];
    results.summary.smallestIcon = results.icons[results.icons.length - 1];

  } catch (error) {
    results.issues.push({
      type: 'error',
      message: `Failed to scan icons: ${error.message}`,
    });
  }
}

/**
 * Check icon usage across codebase
 */
async function checkUsage() {
  try {
    // Find all Icon component usages
    const { stdout } = await execAsync(
      `grep -r "Icon name=" ${config.srcDir} --include="*.tsx" --include="*.ts" | grep -v "node_modules" || true`,
      { cwd: rootDir, maxBuffer: 10 * 1024 * 1024 }
    );

    // Parse usage
    const usageMap = new Map();
    const lines = stdout.split('\n').filter(l => l.trim());

    for (const line of lines) {
      const match = line.match(/Icon name="([^"]+)"/);
      if (match) {
        const iconName = match[1];
        usageMap.set(iconName, (usageMap.get(iconName) || 0) + 1);
      }
    }

    // Categorize icons
    for (const icon of results.icons) {
      const count = usageMap.get(icon.iconName) || 0;

      results.usage.usageCount[icon.iconName] = count;

      if (count > 0) {
        results.usage.used.push({
          ...icon,
          usageCount: count,
        });
      } else {
        results.usage.unused.push(icon);
      }
    }

    // Sort by usage
    results.usage.used.sort((a, b) => b.usageCount - a.usageCount);

  } catch (error) {
    results.issues.push({
      type: 'warning',
      message: `Usage check incomplete: ${error.message}`,
    });
  }
}

/**
 * Check migration progress
 */
async function checkMigration() {
  try {
    // Find files still using lucide-react
    const { stdout } = await execAsync(
      `grep -r "from 'lucide-react'" ${config.srcDir} --include="*.tsx" --include="*.ts" | wc -l`,
      { cwd: rootDir }
    );

    results.migration.remainingFiles = parseInt(stdout.trim()) || 0;

    // Find files using Icon component
    const { stdout: migratedStdout } = await execAsync(
      `grep -r "from '@/components/icons/Icon'" ${config.srcDir} --include="*.tsx" --include="*.ts" | wc -l`,
      { cwd: rootDir }
    );

    results.migration.migratedFiles = parseInt(migratedStdout.trim()) || 0;
    results.migration.totalFiles = results.migration.migratedFiles + results.migration.remainingFiles;

    if (results.migration.totalFiles > 0) {
      results.migration.progress = Math.round(
        (results.migration.migratedFiles / results.migration.totalFiles) * 100
      );
    }

  } catch (error) {
    results.issues.push({
      type: 'info',
      message: `Migration check incomplete: ${error.message}`,
    });
  }
}

/**
 * Validate icon system integrity
 */
async function validateIntegrity() {
  // Check for duplicate icon names
  const nameMap = new Map();
  for (const icon of results.icons) {
    if (nameMap.has(icon.iconName)) {
      results.issues.push({
        type: 'error',
        message: `Duplicate icon name: ${icon.iconName}`,
        files: [nameMap.get(icon.iconName), icon.file],
      });
    } else {
      nameMap.set(icon.iconName, icon.file);
    }
  }

  // Check for naming convention violations
  for (const icon of results.icons) {
    if (!icon.file.startsWith('icon-')) {
      results.issues.push({
        type: 'warning',
        message: `Icon file doesn't follow naming convention: ${icon.file}`,
      });
    }

    if (icon.iconName.includes('_')) {
      results.issues.push({
        type: 'warning',
        message: `Icon name uses underscore (should use kebab-case): ${icon.iconName}`,
      });
    }
  }

  // Check for large files (> 5KB)
  for (const icon of results.icons) {
    if (icon.size > 5 * 1024) {
      results.issues.push({
        type: 'warning',
        message: `Large icon file: ${icon.file} (${(icon.size / 1024).toFixed(1)}KB)`,
      });
    }
  }

  // Check index file exists
  const indexPath = path.join(config.iconsDir, 'svg', 'core', 'index.ts');
  try {
    await fs.access(indexPath);
  } catch {
    results.issues.push({
      type: 'error',
      message: 'Missing index.ts export file',
    });
  }
}

/**
 * Generate human-readable report
 */
function generateReport() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║          CORIA Icon System - Inventory Report                ║
╚══════════════════════════════════════════════════════════════╝

📊 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Icons:        ${results.summary.totalIcons}
Total Size:         ${(results.summary.totalSize / 1024).toFixed(1)} KB
Average Size:       ${(results.summary.averageSize / 1024).toFixed(1)} KB
Largest Icon:       ${results.summary.largestIcon?.file || 'N/A'} (${(results.summary.largestIcon?.size / 1024 || 0).toFixed(1)} KB)
Smallest Icon:      ${results.summary.smallestIcon?.file || 'N/A'} (${(results.summary.smallestIcon?.size / 1024 || 0).toFixed(1)} KB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Usage Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Used Icons:         ${results.usage.used.length}
Unused Icons:       ${results.usage.unused.length}
Usage Rate:         ${((results.usage.used.length / results.summary.totalIcons) * 100).toFixed(1)}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  if (results.usage.used.length > 0) {
    console.log('🔥 Most Used Icons (Top 10):');
    results.usage.used.slice(0, 10).forEach((icon, i) => {
      console.log(`  ${i + 1}. ${icon.iconName}: ${icon.usageCount} usages`);
    });
    console.log('');
  }

  if (results.usage.unused.length > 0) {
    console.log('⚠️  Unused Icons:');
    results.usage.unused.forEach(icon => {
      console.log(`  - ${icon.iconName} (${icon.file})`);
    });
    console.log('');
  }

  console.log(`
🔄 Migration Progress
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files Migrated:     ${results.migration.migratedFiles}/${results.migration.totalFiles} (${results.migration.progress}%)
Remaining:          ${results.migration.remainingFiles} files using lucide-react
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  if (results.issues.length > 0) {
    console.log(`\n⚠️  Issues Found (${results.issues.length}):\n`);

    const errors = results.issues.filter(i => i.type === 'error');
    const warnings = results.issues.filter(i => i.type === 'warning');
    const info = results.issues.filter(i => i.type === 'info');

    if (errors.length > 0) {
      console.log('❌ Errors:');
      errors.forEach(issue => console.log(`  - ${issue.message}`));
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('⚠️  Warnings:');
      warnings.forEach(issue => console.log(`  - ${issue.message}`));
      console.log('');
    }

    if (info.length > 0 && options.verbose) {
      console.log('ℹ️  Info:');
      info.forEach(issue => console.log(`  - ${issue.message}`));
      console.log('');
    }
  } else {
    console.log('✅ No issues found\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Generate JSON report
 */
function generateJSONReport() {
  console.log(JSON.stringify(results, null, 2));
}

/**
 * Generate CI-friendly report
 */
function generateCIReport() {
  const hasErrors = results.issues.some(i => i.type === 'error');
  const hasWarnings = results.issues.some(i => i.type === 'warning');

  if (hasErrors) {
    console.log('::error::Icon system validation failed');
    results.issues.filter(i => i.type === 'error').forEach(issue => {
      console.log(`::error::${issue.message}`);
    });
  }

  if (hasWarnings) {
    results.issues.filter(i => i.type === 'warning').forEach(issue => {
      console.log(`::warning::${issue.message}`);
    });
  }

  console.log(`Icons: ${results.summary.totalIcons}`);
  console.log(`Size: ${(results.summary.totalSize / 1024).toFixed(1)}KB`);
  console.log(`Migration: ${results.migration.progress}%`);

  process.exit(hasErrors ? 1 : 0);
}

/**
 * Main execution
 */
async function main() {
  if (!options.json && !options.ci) {
    console.log('\n🔍 Analyzing icon system...\n');
  }

  try {
    await scanIcons();
    await checkUsage();
    await checkMigration();
    await validateIntegrity();

    if (options.json) {
      generateJSONReport();
    } else if (options.ci) {
      generateCIReport();
    } else {
      generateReport();
    }

    const hasErrors = results.issues.some(i => i.type === 'error');
    process.exit(hasErrors ? 1 : 0);

  } catch (error) {
    console.error('Fatal error:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run check
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
