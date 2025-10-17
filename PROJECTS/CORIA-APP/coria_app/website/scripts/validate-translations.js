#!/usr/bin/env node

/**
 * CORIA Translation Validation Script
 *
 * Comprehensive validation for translation files:
 * - Completeness (no missing keys)
 * - Character encoding (UTF-8, special characters)
 * - Length constraints (prevent UI breaks)
 * - JSON structure integrity
 * - Format string preservation (variables, HTML tags)
 *
 * Usage: node scripts/validate-translations.js [--locale=de,fr] [--strict]
 * Exit codes: 0 = success, 1 = validation errors, 2 = critical errors
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baselineLocale: 'tr',
  targetLocales: ['en', 'de', 'fr'],
  messagesDir: path.join(__dirname, '../src/messages'),
  maxLengthRatio: 1.5, // Max 150% of source length
  minLengthRatio: 0.3, // Min 30% of source length (too short = incomplete)
  strict: false, // Fail on warnings (set via --strict flag)
};

// Parse CLI arguments
const args = process.argv.slice(2);
args.forEach(arg => {
  if (arg.startsWith('--locale=')) {
    CONFIG.targetLocales = arg.split('=')[1].split(',');
  }
  if (arg === '--strict') {
    CONFIG.strict = true;
  }
});

// Validation results
const results = {
  errors: [],
  warnings: [],
  info: [],
  stats: {}
};

/**
 * Flatten nested JSON object to dot notation
 */
function flattenJSON(obj, prefix = '', result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flattenJSON(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

/**
 * Load and parse JSON file with error handling
 */
function loadJSON(locale) {
  const filePath = path.join(CONFIG.messagesDir, `${locale}.json`);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check for BOM (Byte Order Mark)
    if (content.charCodeAt(0) === 0xFEFF) {
      results.warnings.push({
        locale,
        type: 'encoding',
        message: 'File contains BOM (Byte Order Mark). Consider removing it for better compatibility.'
      });
    }

    return JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      results.errors.push({
        locale,
        type: 'json_syntax',
        message: `Invalid JSON syntax: ${error.message}`
      });
    } else {
      results.errors.push({
        locale,
        type: 'file_read',
        message: `Cannot read file: ${error.message}`
      });
    }
    return null;
  }
}

/**
 * Validate completeness: all baseline keys exist in target
 */
function validateCompleteness(baseline, target, locale) {
  const baselineFlat = flattenJSON(baseline);
  const targetFlat = flattenJSON(target);

  const missingKeys = [];
  const emptyValues = [];

  for (const key of Object.keys(baselineFlat)) {
    if (!(key in targetFlat)) {
      missingKeys.push(key);
    } else if (typeof targetFlat[key] === 'string' && (!targetFlat[key] || targetFlat[key].trim() === '')) {
      emptyValues.push(key);
    }
  }

  if (missingKeys.length > 0) {
    results.errors.push({
      locale,
      type: 'completeness',
      message: `Missing ${missingKeys.length} keys`,
      details: missingKeys.slice(0, 10), // Show first 10
      total: missingKeys.length
    });
  }

  if (emptyValues.length > 0) {
    results.errors.push({
      locale,
      type: 'empty_values',
      message: `${emptyValues.length} keys have empty values`,
      details: emptyValues.slice(0, 10),
      total: emptyValues.length
    });
  }

  return {
    missingKeys: missingKeys.length,
    emptyValues: emptyValues.length,
    totalKeys: Object.keys(targetFlat).length
  };
}

/**
 * Validate character encoding and special characters
 */
function validateEncoding(target, locale) {
  const targetFlat = flattenJSON(target);
  const issues = [];

  // Expected special characters by language
  const expectedChars = {
    de: /[äöüßÄÖÜ]/,
    fr: /[àâäæçéèêëïîôùûüÿœÀÂÄÆÇÉÈÊËÏÎÔÙÛÜŸŒ]/,
    en: /[''""–—]/
  };

  const hasExpectedChars = expectedChars[locale];
  let foundExpectedChars = false;

  for (const [key, value] of Object.entries(targetFlat)) {
    if (typeof value !== 'string') continue;

    // Check for expected special characters
    if (hasExpectedChars && hasExpectedChars.test(value)) {
      foundExpectedChars = true;
    }

    // Check for problematic characters
    if (value.includes('�')) {
      issues.push({ key, issue: 'Contains replacement character (�) - encoding issue' });
    }

    // Check for mixed quotes (potential copy-paste issues)
    const quotes = value.match(/["'`''""]/g);
    if (quotes && new Set(quotes).size > 2) {
      issues.push({ key, issue: 'Mixed quote styles detected' });
    }

    // Check for invisible characters (except common whitespace)
    if (/[\u200B-\u200D\uFEFF]/.test(value)) {
      issues.push({ key, issue: 'Contains invisible characters (zero-width spaces, etc.)' });
    }
  }

  if (issues.length > 0) {
    results.warnings.push({
      locale,
      type: 'encoding',
      message: `${issues.length} encoding/character issues found`,
      details: issues.slice(0, 5)
    });
  }

  // Info: Expected special characters not found (might be okay for some content)
  if (hasExpectedChars && !foundExpectedChars && locale !== 'en') {
    results.info.push({
      locale,
      type: 'encoding',
      message: `No language-specific special characters found. Verify translations are not in English.`
    });
  }

  return { issues: issues.length };
}

/**
 * Validate translation length vs source
 */
function validateLength(baseline, target, locale) {
  const baselineFlat = flattenJSON(baseline);
  const targetFlat = flattenJSON(target);

  const tooLong = [];
  const tooShort = [];

  for (const [key, sourceValue] of Object.entries(baselineFlat)) {
    if (!(key in targetFlat)) continue;

    const targetValue = targetFlat[key];
    if (typeof sourceValue !== 'string' || typeof targetValue !== 'string') continue;

    const sourceLen = sourceValue.length;
    const targetLen = targetValue.length;

    if (sourceLen === 0) continue;

    const ratio = targetLen / sourceLen;

    if (ratio > CONFIG.maxLengthRatio) {
      tooLong.push({
        key,
        sourceLen,
        targetLen,
        ratio: ratio.toFixed(2),
        sample: targetValue.substring(0, 60) + '...'
      });
    } else if (ratio < CONFIG.minLengthRatio && targetLen < 10) {
      // Only flag as too short if target is also very short (< 10 chars)
      tooShort.push({
        key,
        sourceLen,
        targetLen,
        ratio: ratio.toFixed(2),
        sample: targetValue
      });
    }
  }

  if (tooLong.length > 0) {
    results.warnings.push({
      locale,
      type: 'length_too_long',
      message: `${tooLong.length} translations exceed 150% of source length (may break UI)`,
      details: tooLong.slice(0, 5)
    });
  }

  if (tooShort.length > 0) {
    results.warnings.push({
      locale,
      type: 'length_too_short',
      message: `${tooShort.length} translations are suspiciously short (may be incomplete)`,
      details: tooShort.slice(0, 5)
    });
  }

  return {
    tooLong: tooLong.length,
    tooShort: tooShort.length
  };
}

/**
 * Validate format strings (variables and HTML tags)
 */
function validateFormatStrings(baseline, target, locale) {
  const baselineFlat = flattenJSON(baseline);
  const targetFlat = flattenJSON(target);

  const issues = [];

  // Regex patterns for format strings
  const patterns = {
    curlyBraces: /\{([^}]+)\}/g, // {variable}
    percent: /%[sd]/g, // %s, %d
    htmlTags: /<(\w+)[^>]*>|<\/(\w+)>/g, // HTML tags
  };

  for (const [key, sourceValue] of Object.entries(baselineFlat)) {
    if (!(key in targetFlat)) continue;

    const targetValue = targetFlat[key];
    if (typeof sourceValue !== 'string' || typeof targetValue !== 'string') continue;

    // Check each pattern type
    Object.entries(patterns).forEach(([patternName, regex]) => {
      const sourceMatches = Array.from(sourceValue.matchAll(regex));
      const targetMatches = Array.from(targetValue.matchAll(regex));

      if (sourceMatches.length !== targetMatches.length) {
        issues.push({
          key,
          issue: `${patternName} count mismatch`,
          source: sourceMatches.map(m => m[0]),
          target: targetMatches.map(m => m[0])
        });
        return;
      }

      // For variables, check they have the same names
      if (patternName === 'curlyBraces') {
        const sourceVars = sourceMatches.map(m => m[1]).sort();
        const targetVars = targetMatches.map(m => m[1]).sort();

        if (JSON.stringify(sourceVars) !== JSON.stringify(targetVars)) {
          issues.push({
            key,
            issue: 'Variable names differ',
            source: sourceVars,
            target: targetVars
          });
        }
      }

      // For HTML tags, check they match
      if (patternName === 'htmlTags') {
        const sourceTags = sourceMatches.map(m => m[1] || m[2]).sort();
        const targetTags = targetMatches.map(m => m[1] || m[2]).sort();

        if (JSON.stringify(sourceTags) !== JSON.stringify(targetTags)) {
          issues.push({
            key,
            issue: 'HTML tags differ',
            source: sourceTags,
            target: targetTags
          });
        }
      }
    });
  }

  if (issues.length > 0) {
    results.errors.push({
      locale,
      type: 'format_strings',
      message: `${issues.length} format string mismatches (variables/HTML tags)`,
      details: issues.slice(0, 5)
    });
  }

  return { issues: issues.length };
}

/**
 * Validate JSON structure matches baseline
 */
function validateStructure(baseline, target, locale) {
  const baselineFlat = flattenJSON(baseline);
  const targetFlat = flattenJSON(target);

  const extraKeys = [];

  for (const key of Object.keys(targetFlat)) {
    if (!(key in baselineFlat)) {
      extraKeys.push(key);
    }
  }

  if (extraKeys.length > 0) {
    results.warnings.push({
      locale,
      type: 'structure',
      message: `${extraKeys.length} extra keys not in baseline (possible typos or deprecated keys)`,
      details: extraKeys.slice(0, 10)
    });
  }

  return { extraKeys: extraKeys.length };
}

/**
 * Print validation results
 */
function printResults() {
  console.log('\n📋 CORIA Translation Validation Report\n');
  console.log('═'.repeat(60));

  // Summary statistics
  console.log('\n📊 Summary:\n');
  Object.entries(results.stats).forEach(([locale, stats]) => {
    const statusIcon = stats.hasErrors ? '❌' : stats.hasWarnings ? '⚠️' : '✅';
    console.log(`${statusIcon} ${locale.toUpperCase()}:`);
    console.log(`   Keys: ${stats.totalKeys}`);
    console.log(`   Missing: ${stats.missingKeys}`);
    console.log(`   Empty: ${stats.emptyValues}`);
    console.log(`   Encoding issues: ${stats.encodingIssues}`);
    console.log(`   Length issues: ${stats.lengthTooLong + stats.lengthTooShort}`);
    console.log(`   Format issues: ${stats.formatIssues}`);
    console.log(`   Extra keys: ${stats.extraKeys}`);
    console.log();
  });

  // Errors
  if (results.errors.length > 0) {
    console.log('❌ ERRORS:\n');
    results.errors.forEach(err => {
      console.log(`[${err.locale.toUpperCase()}] ${err.type}: ${err.message}`);
      if (err.details) {
        err.details.slice(0, 3).forEach(detail => {
          if (typeof detail === 'string') {
            console.log(`   - ${detail}`);
          } else {
            console.log(`   - ${JSON.stringify(detail)}`);
          }
        });
        if (err.total > err.details.length) {
          console.log(`   ... and ${err.total - err.details.length} more`);
        }
      }
      console.log();
    });
  }

  // Warnings
  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    results.warnings.forEach(warn => {
      console.log(`[${warn.locale.toUpperCase()}] ${warn.type}: ${warn.message}`);
      if (warn.details) {
        warn.details.slice(0, 3).forEach(detail => {
          if (typeof detail === 'string') {
            console.log(`   - ${detail}`);
          } else {
            console.log(`   - ${JSON.stringify(detail)}`);
          }
        });
      }
      console.log();
    });
  }

  // Info
  if (results.info.length > 0) {
    console.log('ℹ️  INFO:\n');
    results.info.forEach(info => {
      console.log(`[${info.locale.toUpperCase()}] ${info.message}`);
    });
    console.log();
  }

  console.log('═'.repeat(60));

  // Exit status
  const hasErrors = results.errors.length > 0;
  const hasWarnings = results.warnings.length > 0;

  if (hasErrors) {
    console.log('\n❌ Validation FAILED - Fix errors above\n');
    process.exit(1);
  } else if (hasWarnings && CONFIG.strict) {
    console.log('\n⚠️  Validation FAILED (strict mode) - Fix warnings above\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  Validation PASSED with warnings - Review warnings above\n');
    process.exit(0);
  } else {
    console.log('\n✅ Validation PASSED - All checks successful!\n');
    process.exit(0);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 CORIA Translation Validation\n');
  console.log(`Baseline: ${CONFIG.baselineLocale}.json`);
  console.log(`Targets: ${CONFIG.targetLocales.join(', ')}`);
  console.log(`Strict mode: ${CONFIG.strict ? 'YES' : 'NO'}\n`);

  // Load baseline
  const baseline = loadJSON(CONFIG.baselineLocale);
  if (!baseline) {
    console.error('❌ Cannot load baseline file. Aborting.');
    process.exit(2);
  }

  // Validate each target locale
  CONFIG.targetLocales.forEach(locale => {
    console.log(`\n🌍 Validating ${locale.toUpperCase()}...`);

    const target = loadJSON(locale);
    if (!target) {
      results.stats[locale] = { hasErrors: true };
      return;
    }

    // Run all validations
    const completeness = validateCompleteness(baseline, target, locale);
    const encoding = validateEncoding(target, locale);
    const length = validateLength(baseline, target, locale);
    const formatStrings = validateFormatStrings(baseline, target, locale);
    const structure = validateStructure(baseline, target, locale);

    // Collect stats
    results.stats[locale] = {
      totalKeys: completeness.totalKeys,
      missingKeys: completeness.missingKeys,
      emptyValues: completeness.emptyValues,
      encodingIssues: encoding.issues,
      lengthTooLong: length.tooLong,
      lengthTooShort: length.tooShort,
      formatIssues: formatStrings.issues,
      extraKeys: structure.extraKeys,
      hasErrors: results.errors.some(e => e.locale === locale),
      hasWarnings: results.warnings.some(w => w.locale === locale)
    };

    const statusIcon = results.stats[locale].hasErrors ? '❌' :
                       results.stats[locale].hasWarnings ? '⚠️' : '✅';
    console.log(`${statusIcon} ${locale.toUpperCase()} validation complete`);
  });

  // Print comprehensive results
  printResults();
}

// Execute
if (require.main === module) {
  main();
}

module.exports = { validateCompleteness, validateEncoding, validateLength, validateFormatStrings };
