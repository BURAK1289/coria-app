#!/usr/bin/env node

/**
 * Manual Icon System Validation
 * Quick validation script for icon migration
 *
 * Checks:
 * 1. No lucide-react imports remain
 * 2. All CORIA Icon components are used correctly
 * 3. Accessibility attributes are present
 * 4. Icon sizes are consistent
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, relative, dirname } from 'path';
import { execSync } from 'child_process';

const SRC_DIR = 'src';
const RESULTS_FILE = 'test-results/icon-qa/reports/manual-validation.json';

class IconValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      validation: 'Phase 3.3 Icon Migration',
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };
  }

  addCheck(name, status, details = {}) {
    this.results.checks.push({
      name,
      status,
      details,
      timestamp: new Date().toISOString(),
    });

    this.results.summary.total++;
    if (status === 'passed') this.results.summary.passed++;
    else if (status === 'failed') this.results.summary.failed++;
    else if (status === 'warning') this.results.summary.warnings++;
  }

  /**
   * Check 1: No lucide-react imports
   */
  checkLucideReactImports() {
    console.log('\n🔍 Check 1: Verifying lucide-react removal...');

    try {
      const result = execSync(
        `grep -r "from 'lucide-react'" ${SRC_DIR} --include="*.tsx" --include="*.ts" || echo "NONE"`,
        { encoding: 'utf-8' }
      );

      if (result.trim() === 'NONE' || result.trim() === '') {
        console.log('   ✅ No lucide-react imports found');
        this.addCheck('lucide-react removal', 'passed', {
          message: 'All lucide-react imports successfully removed',
        });
      } else {
        console.log('   ❌ lucide-react imports still present:');
        console.log('   ' + result.trim());
        this.addCheck('lucide-react removal', 'failed', {
          message: 'lucide-react imports still exist',
          locations: result.trim().split('\n'),
        });
      }
    } catch (error) {
      console.log('   ✅ No lucide-react imports found (grep returned no matches)');
      this.addCheck('lucide-react removal', 'passed');
    }
  }

  /**
   * Check 2: CORIA Icon usage patterns
   */
  checkCoriaIconUsage() {
    console.log('\n🔍 Check 2: Verifying CORIA Icon component usage...');

    const files = this.getAllTsxFiles(SRC_DIR);
    let totalIcons = 0;
    let invalidUsages = [];

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');

      // Count Icon component usages
      const iconMatches = content.match(/<Icon\s+name=/g);
      if (iconMatches) {
        totalIcons += iconMatches.length;

        // Check for proper size prop
        const iconLines = content.split('\n').filter(line => line.includes('<Icon'));

        for (const line of iconLines) {
          if (!line.includes('size=')) {
            invalidUsages.push({
              file: relative(process.cwd(), file),
              issue: 'Missing size prop',
              line: line.trim(),
            });
          }
        }
      }
    }

    console.log(`   ℹ️  Found ${totalIcons} Icon component usages`);

    if (invalidUsages.length === 0) {
      console.log('   ✅ All Icon components have proper size props');
      this.addCheck('CORIA Icon usage', 'passed', {
        totalIcons,
        message: 'All Icon components properly configured',
      });
    } else {
      console.log(`   ⚠️  ${invalidUsages.length} Icon(s) missing size prop`);
      this.addCheck('CORIA Icon usage', 'warning', {
        totalIcons,
        invalidUsages: invalidUsages.slice(0, 5), // Limit to first 5
      });
    }
  }

  /**
   * Check 3: Accessibility attributes
   */
  checkAccessibility() {
    console.log('\n🔍 Check 3: Verifying icon accessibility...');

    const files = this.getAllTsxFiles(SRC_DIR);
    let totalIcons = 0;
    let missingAriaHidden = 0;

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const iconLines = content.split('\n').filter(line => line.includes('<Icon'));

      for (const line of iconLines) {
        totalIcons++;
        if (!line.includes('aria-hidden')) {
          missingAriaHidden++;
        }
      }
    }

    const percentageCompliant = ((totalIcons - missingAriaHidden) / totalIcons * 100).toFixed(1);

    console.log(`   ℹ️  ${totalIcons} total icons, ${totalIcons - missingAriaHidden} with aria-hidden`);
    console.log(`   ℹ️  ${percentageCompliant}% accessibility compliance`);

    if (missingAriaHidden === 0) {
      console.log('   ✅ All icons have proper aria-hidden attributes');
      this.addCheck('icon accessibility', 'passed', {
        totalIcons,
        compliant: totalIcons,
      });
    } else {
      console.log(`   ⚠️  ${missingAriaHidden} icon(s) missing aria-hidden`);
      this.addCheck('icon accessibility', 'warning', {
        totalIcons,
        missing: missingAriaHidden,
        percentageCompliant,
      });
    }
  }

  /**
   * Check 4: Icon size consistency
   */
  checkSizeConsistency() {
    console.log('\n🔍 Check 4: Verifying icon size consistency...');

    const files = this.getAllTsxFiles(SRC_DIR);
    const sizeUsage = new Map();

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const sizeMatches = content.matchAll(/size=\{(\d+)\}/g);

      for (const match of sizeMatches) {
        const size = parseInt(match[1]);
        sizeUsage.set(size, (sizeUsage.get(size) || 0) + 1);
      }
    }

    const sizes = Array.from(sizeUsage.entries()).sort((a, b) => b[1] - a[1]);

    console.log('   ℹ️  Icon size distribution:');
    sizes.forEach(([size, count]) => {
      console.log(`      ${size}px: ${count} usages`);
    });

    // Check for standard sizes (16, 20, 24, 48)
    const standardSizes = [16, 20, 24, 48];
    const nonStandardSizes = sizes.filter(([size]) => !standardSizes.includes(size));

    if (nonStandardSizes.length === 0) {
      console.log('   ✅ All icons use standard sizes');
      this.addCheck('size consistency', 'passed', {
        sizes: Object.fromEntries(sizes),
        message: 'All sizes follow standard: 16, 20, 24, 48',
      });
    } else {
      console.log(`   ⚠️  ${nonStandardSizes.length} non-standard size(s) found`);
      this.addCheck('size consistency', 'warning', {
        sizes: Object.fromEntries(sizes),
        nonStandard: Object.fromEntries(nonStandardSizes),
      });
    }
  }

  /**
   * Check 5: Build verification
   */
  checkBuildSuccess() {
    console.log('\n🔍 Check 5: Verifying production build...');

    try {
      console.log('   ⏳ Running production build (this may take a minute)...');
      execSync('npm run build', { stdio: 'pipe' });

      console.log('   ✅ Production build successful');
      this.addCheck('production build', 'passed', {
        message: 'Build completed without errors',
      });
    } catch (error) {
      console.log('   ❌ Production build failed');
      this.addCheck('production build', 'failed', {
        message: 'Build failed - check build output',
        error: error.message,
      });
    }
  }

  /**
   * Helper: Get all TSX files recursively
   */
  getAllTsxFiles(dir) {
    let files = [];

    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and test directories
        if (!['node_modules', '.next', 'test-results'].includes(item)) {
          files = files.concat(this.getAllTsxFiles(fullPath));
        }
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Generate final report
   */
  generateReport() {
    console.log('\n' + '━'.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('━'.repeat(60));
    console.log(`Total Checks: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
    console.log('━'.repeat(60));

    if (this.results.summary.failed === 0) {
      console.log('\n✅ All critical checks passed!');
      console.log('Icon migration is validated and ready for production.\n');
    } else {
      console.log('\n⚠️  Some checks failed. Review the issues above.\n');
    }

    // Save detailed results
    const dir = dirname(RESULTS_FILE);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(RESULTS_FILE, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed report saved to: ${RESULTS_FILE}\n`);
  }

  /**
   * Run all validations
   */
  async run() {
    console.log('🚀 Icon System Manual Validation - Phase 3.3');
    console.log('━'.repeat(60));

    this.checkLucideReactImports();
    this.checkCoriaIconUsage();
    this.checkAccessibility();
    this.checkSizeConsistency();
    this.checkBuildSuccess();

    this.generateReport();

    return this.results.summary.failed === 0;
  }
}

// Execute validation
const validator = new IconValidator();
validator.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
