#!/usr/bin/env node

/**
 * CORIA Icon System - Build Pipeline
 *
 * Automated SVG optimization and React component generation pipeline.
 *
 * Pipeline stages:
 * 1. Clean: Remove previous build artifacts
 * 2. Optimize: SVGO optimization with stroke preservation
 * 3. Generate: SVGR React component generation
 * 4. Validate: Check output and report errors
 *
 * Usage:
 *   npm run icons:build              # Full pipeline
 *   npm run icons:build -- --watch   # Watch mode
 *   npm run icons:build -- --dry-run # Preview without writing
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
  sourceDir: path.join(rootDir, 'src', 'components', 'icons', 'svg', 'source'),
  optimizedDir: path.join(rootDir, 'src', 'components', 'icons', 'svg', 'optimized'),
  outputDir: path.join(rootDir, 'src', 'components', 'icons', 'svg', 'core'),
  svgoConfig: path.join(rootDir, 'svgo.config.js'),
  svgrConfig: path.join(rootDir, 'svgr.config.js'),
};

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  watch: args.includes('--watch'),
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose') || args.includes('-v'),
};

// Logging utilities
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  verbose: (msg) => options.verbose && console.log(`🔍 ${msg}`),
  step: (step, msg) => console.log(`\n${'='.repeat(60)}\n${step}. ${msg}\n${'='.repeat(60)}`),
};

// Statistics tracking
const stats = {
  source: 0,
  optimized: 0,
  generated: 0,
  failed: 0,
  sizeReduction: 0,
  errors: [],
};

/**
 * Ensure required directories exist
 */
async function ensureDirectories() {
  log.step(1, 'Setting up directories');

  const dirs = [
    config.sourceDir,
    config.optimizedDir,
    config.outputDir,
  ];

  for (const dir of dirs) {
    try {
      await fs.access(dir);
      log.verbose(`Directory exists: ${path.relative(rootDir, dir)}`);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      log.info(`Created directory: ${path.relative(rootDir, dir)}`);
    }
  }

  log.success('Directories ready');
}

/**
 * Get all SVG files from source directory
 */
async function getSVGFiles() {
  log.step(2, 'Discovering SVG files');

  try {
    const files = await fs.readdir(config.sourceDir);
    const svgFiles = files.filter(f => f.endsWith('.svg'));

    stats.source = svgFiles.length;
    log.success(`Found ${svgFiles.length} SVG files`);

    if (svgFiles.length === 0) {
      log.warn('No SVG files found in source directory');
      log.info(`Add SVG files to: ${path.relative(rootDir, config.sourceDir)}`);
    }

    return svgFiles;
  } catch (error) {
    log.error(`Failed to read source directory: ${error.message}`);
    throw error;
  }
}

/**
 * Optimize SVG files using SVGO
 */
async function optimizeSVGs(files) {
  log.step(3, 'Optimizing SVGs with SVGO');

  if (files.length === 0) {
    log.warn('No files to optimize');
    return [];
  }

  if (options.dryRun) {
    log.info('Dry run mode - skipping actual optimization');
    return files;
  }

  try {
    // Install SVGO if needed
    try {
      await execAsync('npx svgo --version', { cwd: rootDir });
    } catch {
      log.info('Installing SVGO...');
      await execAsync('npm install --save-dev svgo', { cwd: rootDir });
    }

    // Run SVGO optimization
    const inputPattern = path.join(config.sourceDir, '*.svg');
    const cmd = `npx svgo --config ${config.svgoConfig} --folder ${config.sourceDir} --output ${config.optimizedDir}`;

    log.verbose(`Running: ${cmd}`);
    const { stdout, stderr } = await execAsync(cmd, { cwd: rootDir });

    if (options.verbose && stdout) log.verbose(stdout);
    if (stderr) log.warn(stderr);

    // Verify optimized files
    const optimizedFiles = await fs.readdir(config.optimizedDir);
    const svgFiles = optimizedFiles.filter(f => f.endsWith('.svg'));

    stats.optimized = svgFiles.length;
    log.success(`Optimized ${svgFiles.length} SVG files`);

    // Calculate size reduction
    let originalSize = 0;
    let optimizedSize = 0;

    for (const file of svgFiles) {
      const originalPath = path.join(config.sourceDir, file);
      const optimizedPath = path.join(config.optimizedDir, file);

      try {
        const [originalStat, optimizedStat] = await Promise.all([
          fs.stat(originalPath),
          fs.stat(optimizedPath),
        ]);

        originalSize += originalStat.size;
        optimizedSize += optimizedStat.size;
      } catch (error) {
        log.verbose(`Size comparison skipped for ${file}: ${error.message}`);
      }
    }

    if (originalSize > 0) {
      const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      stats.sizeReduction = reduction;
      log.success(`Size reduction: ${reduction}% (${originalSize} → ${optimizedSize} bytes)`);
    }

    return svgFiles;
  } catch (error) {
    log.error(`SVGO optimization failed: ${error.message}`);
    stats.errors.push({ stage: 'optimize', error: error.message });
    throw error;
  }
}

/**
 * Generate React components using SVGR
 */
async function generateComponents(files) {
  log.step(4, 'Generating React components with SVGR');

  if (files.length === 0) {
    log.warn('No files to generate components for');
    return;
  }

  if (options.dryRun) {
    log.info('Dry run mode - skipping actual generation');
    return;
  }

  try {
    // Install SVGR if needed
    try {
      await execAsync('npx @svgr/cli --version', { cwd: rootDir });
    } catch {
      log.info('Installing SVGR...');
      await execAsync('npm install --save-dev @svgr/cli @svgr/core @svgr/plugin-jsx @svgr/plugin-svgo @svgr/plugin-prettier', { cwd: rootDir });
    }

    // Run SVGR transformation
    const cmd = `npx @svgr/cli --config-file ${config.svgrConfig} --out-dir ${config.outputDir} --typescript --filename-case kebab ${config.optimizedDir}`;

    log.verbose(`Running: ${cmd}`);
    const { stdout, stderr } = await execAsync(cmd, { cwd: rootDir });

    if (options.verbose && stdout) log.verbose(stdout);
    if (stderr) log.warn(stderr);

    // Verify generated files
    const generatedFiles = await fs.readdir(config.outputDir);
    const tsxFiles = generatedFiles.filter(f => f.endsWith('.tsx'));

    stats.generated = tsxFiles.length;
    log.success(`Generated ${tsxFiles.length} React components`);

    // List generated components
    if (options.verbose) {
      log.verbose('Generated components:');
      tsxFiles.forEach(file => log.verbose(`  - ${file}`));
    }

  } catch (error) {
    log.error(`SVGR generation failed: ${error.message}`);
    stats.errors.push({ stage: 'generate', error: error.message });
    throw error;
  }
}

/**
 * Validate build output
 */
async function validateBuild() {
  log.step(5, 'Validating build output');

  const issues = [];

  // Check if output directory exists and has files
  try {
    const files = await fs.readdir(config.outputDir);
    const tsxFiles = files.filter(f => f.endsWith('.tsx'));

    if (tsxFiles.length === 0) {
      issues.push('No .tsx files generated in output directory');
    }

    // Verify index file exists
    const indexPath = path.join(config.outputDir, 'index.ts');
    try {
      await fs.access(indexPath);
      log.success('Index file exists');
    } catch {
      issues.push('Missing index.ts export file');
    }

    // Check file size (warn if too large)
    for (const file of tsxFiles) {
      const filePath = path.join(config.outputDir, file);
      const stat = await fs.stat(filePath);

      if (stat.size > 10 * 1024) { // > 10KB
        issues.push(`Large component file: ${file} (${(stat.size / 1024).toFixed(1)}KB)`);
      }
    }

  } catch (error) {
    issues.push(`Validation error: ${error.message}`);
  }

  if (issues.length > 0) {
    log.warn('Validation issues found:');
    issues.forEach(issue => log.warn(`  - ${issue}`));
  } else {
    log.success('Build validation passed');
  }

  return issues;
}

/**
 * Generate build summary report
 */
function generateSummary() {
  log.step(6, 'Build Summary');

  console.log(`
📊 Build Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source SVGs:        ${stats.source}
Optimized:          ${stats.optimized}
Components:         ${stats.generated}
Failed:             ${stats.failed}
Size Reduction:     ${stats.sizeReduction}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors (${stats.errors.length}):`);
    stats.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. [${err.stage}] ${err.error}`);
    });
  }

  if (options.dryRun) {
    console.log('\n🔍 Dry run mode - no files were modified');
  }

  console.log('\n✅ Icon build pipeline complete!\n');
}

/**
 * Main build pipeline execution
 */
async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║          CORIA Icon System - Build Pipeline                  ║
╚══════════════════════════════════════════════════════════════╝
`);

  if (options.dryRun) {
    log.info('Running in DRY RUN mode - no files will be modified');
  }

  if (options.watch) {
    log.info('Watch mode not yet implemented - running single build');
  }

  try {
    // Execute pipeline stages
    await ensureDirectories();
    const svgFiles = await getSVGFiles();
    const optimizedFiles = await optimizeSVGs(svgFiles);
    await generateComponents(optimizedFiles);
    await validateBuild();

    // Generate summary
    generateSummary();

    process.exit(0);
  } catch (error) {
    log.error(`Build pipeline failed: ${error.message}`);

    if (options.verbose) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    generateSummary();
    process.exit(1);
  }
}

// Run pipeline
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
