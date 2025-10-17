#!/usr/bin/env node

/**
 * CI Icon Dependency Guard
 *
 * Prevents re-introduction of lucide-react or other icon dependencies
 * after Phase 3.3 migration to CORIA Icon system.
 *
 * This script:
 * 1. Checks for lucide-react in package.json
 * 2. Scans codebase for lucide-react imports
 * 3. Validates CORIA Icon usage patterns
 * 4. Exits with error code if issues found (fails CI)
 *
 * Usage:
 *   npm run icons:ci-guard
 *   node scripts/ci-icon-guard.mjs
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

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const issues = {
  critical: [],
  warnings: [],
};

/**
 * Check if lucide-react exists in package.json
 */
async function checkPackageJson() {
  console.log(`${colors.cyan}[1/4] Checking package.json for lucide-react...${colors.reset}`);

  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    // Check dependencies
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
    };

    const lucidePackages = Object.keys(deps).filter(
      (pkg) => pkg.includes('lucide') || pkg === 'react-icons' || pkg === '@heroicons/react'
    );

    if (lucidePackages.includes('lucide-react')) {
      issues.critical.push({
        type: 'DEPENDENCY',
        message: 'lucide-react found in package.json',
        details: `Version: ${deps['lucide-react']}`,
        fix: 'Run: npm uninstall lucide-react',
      });
    }

    // Info: Other icon libraries (not critical, but should be aware)
    const otherIconLibs = lucidePackages.filter((pkg) => pkg !== 'lucide-react');
    if (otherIconLibs.length > 0) {
      issues.warnings.push({
        type: 'INFO',
        message: `Other icon libraries detected: ${otherIconLibs.join(', ')}`,
        details: 'Consider consolidating to CORIA Icon system',
      });
    }

    if (!lucidePackages.includes('lucide-react')) {
      console.log(`  ${colors.green}✓${colors.reset} No lucide-react in package.json`);
    }
  } catch (error) {
    issues.critical.push({
      type: 'ERROR',
      message: 'Failed to read package.json',
      details: error.message,
    });
  }
}

/**
 * Scan codebase for lucide-react imports
 */
async function scanImports() {
  console.log(`${colors.cyan}[2/4] Scanning codebase for lucide-react imports...${colors.reset}`);

  try {
    const srcDir = path.join(rootDir, 'src');

    // Find all lucide-react imports
    const { stdout } = await execAsync(
      `grep -r "from 'lucide-react'" ${srcDir} --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" | grep -v "node_modules" || true`,
      { cwd: rootDir, maxBuffer: 10 * 1024 * 1024 }
    );

    const imports = stdout
      .trim()
      .split('\n')
      .filter((line) => line);

    if (imports.length > 0 && imports[0] !== '') {
      imports.forEach((importLine) => {
        const [file, ...rest] = importLine.split(':');
        const relativePath = path.relative(rootDir, file);

        issues.critical.push({
          type: 'IMPORT',
          message: `lucide-react import found in ${relativePath}`,
          details: rest.join(':').trim(),
          fix: 'Migrate to: import { Icon } from "@/components/icons/Icon"',
        });
      });
    } else {
      console.log(`  ${colors.green}✓${colors.reset} No lucide-react imports found`);
    }

    // Check for direct Icon usage from lucide-react (destructured imports)
    const { stdout: destructuredStdout } = await execAsync(
      `grep -rE "import\\\\s*\\\\{[^}]*\\\\}\\\\s*from\\\\s*['\\\"]lucide-react['\\\"]" ${srcDir} --include="*.tsx" --include="*.ts" || true`,
      { cwd: rootDir, maxBuffer: 10 * 1024 * 1024 }
    );

    const destructuredImports = destructuredStdout
      .trim()
      .split('\n')
      .filter((line) => line && line !== '');

    if (destructuredImports.length > 0) {
      destructuredImports.forEach((importLine) => {
        const [file, ...rest] = importLine.split(':');
        const relativePath = path.relative(rootDir, file);

        issues.critical.push({
          type: 'IMPORT',
          message: `Destructured lucide-react import in ${relativePath}`,
          details: rest.join(':').trim(),
          fix: 'Replace with CORIA Icon component',
        });
      });
    }
  } catch (error) {
    issues.warnings.push({
      type: 'WARNING',
      message: 'Import scan incomplete',
      details: error.message,
    });
  }
}

/**
 * Validate CORIA Icon usage patterns
 */
async function validateIconUsage() {
  console.log(`${colors.cyan}[3/4] Validating CORIA Icon usage patterns...${colors.reset}`);

  try {
    const srcDir = path.join(rootDir, 'src');

    // Find all Icon component usages
    const { stdout } = await execAsync(
      `grep -r "Icon name=" ${srcDir} --include="*.tsx" --include="*.ts" | grep -v "node_modules" || true`,
      { cwd: rootDir, maxBuffer: 10 * 1024 * 1024 }
    );

    const usages = stdout
      .trim()
      .split('\n')
      .filter((line) => line);

    if (usages.length > 0 && usages[0] !== '') {
      console.log(`  ${colors.green}✓${colors.reset} Found ${usages.length} CORIA Icon usages`);

      // Check for common anti-patterns
      for (const usage of usages) {
        // Check for missing size prop (using className for dimensions)
        if (usage.includes('className="h-') || usage.includes('className="w-')) {
          const [file] = usage.split(':');
          const relativePath = path.relative(rootDir, file);

          issues.warnings.push({
            type: 'PATTERN',
            message: `Icon using className for dimensions in ${relativePath}`,
            details: 'Prefer size prop over className (e.g., size={24})',
          });
        }

        // Check for missing accessibility attributes
        if (!usage.includes('aria-')) {
          const [file] = usage.split(':');
          const relativePath = path.relative(rootDir, file);

          issues.warnings.push({
            type: 'A11Y',
            message: `Icon missing accessibility attributes in ${relativePath}`,
            details: 'Add aria-hidden="true" for decorative icons or proper aria-label',
          });
        }
      }
    } else {
      issues.warnings.push({
        type: 'WARNING',
        message: 'No CORIA Icon usages found',
        details: 'Expected to find Icon component usages in the codebase',
      });
    }
  } catch (error) {
    issues.warnings.push({
      type: 'WARNING',
      message: 'Icon usage validation incomplete',
      details: error.message,
    });
  }
}

/**
 * Check Icon component exists
 */
async function checkIconComponent() {
  console.log(`${colors.cyan}[4/4] Verifying CORIA Icon component exists...${colors.reset}`);

  try {
    const iconComponentPath = path.join(rootDir, 'src', 'components', 'icons', 'Icon.tsx');
    await fs.access(iconComponentPath);
    console.log(`  ${colors.green}✓${colors.reset} CORIA Icon component found`);
  } catch {
    issues.critical.push({
      type: 'MISSING',
      message: 'CORIA Icon component not found',
      details: 'Expected at: src/components/icons/Icon.tsx',
      fix: 'Ensure Icon.tsx component exists',
    });
  }
}

/**
 * Generate report
 */
function generateReport() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.blue}CI Icon Dependency Guard - Results${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  const hasCritical = issues.critical.length > 0;
  const hasWarnings = issues.warnings.length > 0;

  if (!hasCritical && !hasWarnings) {
    console.log(`${colors.green}✓ All checks passed!${colors.reset}`);
    console.log(`${colors.green}✓ No lucide-react dependencies found${colors.reset}`);
    console.log(`${colors.green}✓ CORIA Icon system is properly configured${colors.reset}\n`);
    return 0;
  }

  // Critical issues (will fail CI)
  if (hasCritical) {
    console.log(`${colors.red}❌ Critical Issues (${issues.critical.length}):${colors.reset}\n`);
    issues.critical.forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.type}] ${issue.message}`);
      if (issue.details) {
        console.log(`   ${colors.yellow}Details:${colors.reset} ${issue.details}`);
      }
      if (issue.fix) {
        console.log(`   ${colors.cyan}Fix:${colors.reset} ${issue.fix}`);
      }
      console.log('');
    });
  }

  // Warnings (won't fail CI, but should be addressed)
  if (hasWarnings) {
    console.log(`${colors.yellow}⚠️  Warnings (${issues.warnings.length}):${colors.reset}\n`);
    issues.warnings.forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.type}] ${issue.message}`);
      if (issue.details) {
        console.log(`   ${colors.yellow}Details:${colors.reset} ${issue.details}`);
      }
      console.log('');
    });
  }

  console.log('='.repeat(70) + '\n');

  if (hasCritical) {
    console.log(`${colors.red}❌ CI Guard FAILED - Please fix critical issues above${colors.reset}\n`);
    return 1;
  } else {
    console.log(`${colors.green}✓ CI Guard PASSED - Warnings should be addressed${colors.reset}\n`);
    return 0;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n${colors.blue}🛡️  CORIA Icon Dependency Guard${colors.reset}`);
  console.log(`${colors.blue}Protecting against lucide-react re-introduction${colors.reset}\n`);

  try {
    await checkPackageJson();
    await scanImports();
    await validateIconUsage();
    await checkIconComponent();

    const exitCode = generateReport();
    process.exit(exitCode);
  } catch (error) {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run guard
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
