#!/usr/bin/env node

/**
 * CORIA Translation Gap Extraction Script
 *
 * Compares tr.json (baseline) against de.json and fr.json to identify missing translation keys.
 * Generates detailed reports in JSON and Markdown formats with categorization and context.
 *
 * Usage: node scripts/extract-missing-translations.js
 * Output: reports/translation-gaps-{locale}-{timestamp}.{json|md}
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baselineLocale: 'tr',
  targetLocales: ['de', 'fr'],
  messagesDir: path.join(__dirname, '../src/messages'),
  reportsDir: path.join(__dirname, '../reports'),
  categories: {
    nav: { priority: 1, label: 'Navigation', context: 'Top navigation menu and footer links' },
    hero: { priority: 1, label: 'Hero Section', context: 'Landing page hero content' },
    cta: { priority: 1, label: 'Call-to-Actions', context: 'Buttons and action triggers' },
    features: { priority: 2, label: 'Features', context: 'Product features and benefits' },
    pricing: { priority: 2, label: 'Pricing', context: 'Pricing plans and payment options' },
    blog: { priority: 3, label: 'Blog', context: 'Blog posts and articles' },
    footer: { priority: 2, label: 'Footer', context: 'Footer section content' },
    about: { priority: 2, label: 'About', context: 'About page and company info' },
    foundation: { priority: 2, label: 'Foundation', context: 'CORIA Foundation content' },
    faq: { priority: 2, label: 'FAQ', context: 'Frequently asked questions' },
    contact: { priority: 2, label: 'Contact', context: 'Contact forms and info' },
    error: { priority: 1, label: 'Error Messages', context: 'Error and validation messages' },
    common: { priority: 1, label: 'Common UI', context: 'Common UI elements and labels' },
    meta: { priority: 2, label: 'SEO Metadata', context: 'Page titles and meta descriptions' },
  }
};

/**
 * Flatten nested JSON object to dot notation
 * Example: {nav: {home: "Home"}} => {"nav.home": "Home"}
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
 * Categorize a translation key based on its path
 */
function categorizeKey(key) {
  const firstSegment = key.split('.')[0].toLowerCase();

  // Check for exact category matches
  if (CONFIG.categories[firstSegment]) {
    return firstSegment;
  }

  // Check for partial matches
  if (key.includes('button') || key.includes('cta') || key.toLowerCase().includes('action')) {
    return 'cta';
  }
  if (key.includes('error') || key.includes('validation')) {
    return 'error';
  }

  // Default to common
  return 'common';
}

/**
 * Load and parse JSON file
 */
function loadJSON(locale) {
  const filePath = path.join(CONFIG.messagesDir, `${locale}.json`);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error loading ${locale}.json:`, error.message);
    process.exit(1);
  }
}

/**
 * Find missing keys in target locale compared to baseline
 */
function findMissingKeys(baseline, target, locale) {
  const baselineFlat = flattenJSON(baseline);
  const targetFlat = flattenJSON(target);

  const missing = [];

  for (const [key, value] of Object.entries(baselineFlat)) {
    if (!(key in targetFlat)) {
      const category = categorizeKey(key);
      missing.push({
        key,
        sourceText: value,
        category,
        priority: CONFIG.categories[category]?.priority || 3,
        context: CONFIG.categories[category]?.context || 'General content',
        nestingLevel: key.split('.').length - 1
      });
    }
  }

  return missing;
}

/**
 * Generate statistics from missing keys
 */
function generateStats(missingKeys) {
  const stats = {
    total: missingKeys.length,
    byCategory: {},
    byPriority: { 1: 0, 2: 0, 3: 0 },
    avgNestingLevel: 0
  };

  missingKeys.forEach(item => {
    // By category
    if (!stats.byCategory[item.category]) {
      stats.byCategory[item.category] = {
        count: 0,
        label: CONFIG.categories[item.category]?.label || item.category,
        priority: item.priority
      };
    }
    stats.byCategory[item.category].count++;

    // By priority
    stats.byPriority[item.priority]++;

    // Nesting level
    stats.avgNestingLevel += item.nestingLevel;
  });

  stats.avgNestingLevel = (stats.avgNestingLevel / missingKeys.length).toFixed(2);

  return stats;
}

/**
 * Generate JSON report
 */
function generateJSONReport(locale, missingKeys, stats) {
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `translation-gaps-${locale}-${timestamp}.json`;
  const filePath = path.join(CONFIG.reportsDir, fileName);

  const report = {
    locale,
    generatedAt: new Date().toISOString(),
    summary: stats,
    missingKeys: missingKeys.sort((a, b) => {
      // Sort by priority first, then category
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.category.localeCompare(b.category);
    })
  };

  // Ensure reports directory exists
  if (!fs.existsSync(CONFIG.reportsDir)) {
    fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  return filePath;
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(locale, missingKeys, stats) {
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `translation-gaps-${locale}-${timestamp}.md`;
  const filePath = path.join(CONFIG.reportsDir, fileName);

  const languageName = locale === 'de' ? 'German' : 'French';

  let markdown = `# ${languageName} Translation Gap Report\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;

  // Executive Summary
  markdown += `## 📊 Executive Summary\n\n`;
  markdown += `- **Total Missing Keys:** ${stats.total}\n`;
  markdown += `- **Priority 1 (Critical):** ${stats.byPriority[1]} keys\n`;
  markdown += `- **Priority 2 (Important):** ${stats.byPriority[2]} keys\n`;
  markdown += `- **Priority 3 (Nice-to-have):** ${stats.byPriority[3]} keys\n`;
  markdown += `- **Average Nesting Level:** ${stats.avgNestingLevel}\n\n`;

  // Effort Estimation
  const estimatedHours = Math.ceil(stats.total / 25); // ~25 keys per hour
  markdown += `**Estimated Translation Effort:** ${estimatedHours}-${estimatedHours + 5} hours\n\n`;

  // By Category
  markdown += `## 📁 Missing Keys by Category\n\n`;
  markdown += `| Category | Count | Priority | Context |\n`;
  markdown += `|----------|-------|----------|----------|\n`;

  Object.entries(stats.byCategory)
    .sort((a, b) => a[1].priority - b[1].priority)
    .forEach(([key, data]) => {
      const priority = '⭐'.repeat(data.priority);
      const context = CONFIG.categories[key]?.context || 'General content';
      markdown += `| ${data.label} | ${data.count} | ${priority} | ${context} |\n`;
    });

  markdown += `\n`;

  // Detailed Keys by Priority
  for (let priority = 1; priority <= 3; priority++) {
    const priorityKeys = missingKeys.filter(k => k.priority === priority);
    if (priorityKeys.length === 0) continue;

    const priorityLabel = priority === 1 ? 'Critical' : priority === 2 ? 'Important' : 'Nice-to-have';
    markdown += `## Priority ${priority}: ${priorityLabel} (${priorityKeys.length} keys)\n\n`;

    // Group by category
    const byCategory = {};
    priorityKeys.forEach(key => {
      if (!byCategory[key.category]) byCategory[key.category] = [];
      byCategory[key.category].push(key);
    });

    Object.entries(byCategory).forEach(([category, keys]) => {
      const categoryLabel = CONFIG.categories[category]?.label || category;
      markdown += `### ${categoryLabel} (${keys.length} keys)\n\n`;
      markdown += `| Key | Turkish Source Text |\n`;
      markdown += `|-----|---------------------|\n`;

      keys.slice(0, 20).forEach(item => { // Limit to 20 per category for readability
        const truncatedText = item.sourceText.length > 80
          ? item.sourceText.substring(0, 77) + '...'
          : item.sourceText;
        markdown += `| \`${item.key}\` | ${truncatedText} |\n`;
      });

      if (keys.length > 20) {
        markdown += `\n*... and ${keys.length - 20} more keys in this category*\n`;
      }

      markdown += `\n`;
    });
  }

  // Next Steps
  markdown += `## 🚀 Next Steps\n\n`;
  markdown += `1. Review this report with the translation team\n`;
  markdown += `2. Prioritize translation work (start with Priority 1)\n`;
  markdown += `3. Use the JSON report for automated processing\n`;
  markdown += `4. Refer to Translation_Task_${locale.toUpperCase()}.md for detailed translator instructions\n`;
  markdown += `5. Run validation after translations: \`npm run i18n:validate\`\n\n`;

  // Ensure reports directory exists
  if (!fs.existsSync(CONFIG.reportsDir)) {
    fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
  }

  fs.writeFileSync(filePath, markdown);
  return filePath;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 CORIA Translation Gap Extraction\n');

  // Load baseline
  console.log(`📖 Loading baseline (${CONFIG.baselineLocale}.json)...`);
  const baseline = loadJSON(CONFIG.baselineLocale);
  const baselineKeys = Object.keys(flattenJSON(baseline)).length;
  console.log(`   ✓ ${baselineKeys} keys loaded\n`);

  // Process each target locale
  CONFIG.targetLocales.forEach(locale => {
    console.log(`🌍 Processing ${locale.toUpperCase()}...`);

    const target = loadJSON(locale);
    const targetKeys = Object.keys(flattenJSON(target)).length;
    console.log(`   ℹ Current keys: ${targetKeys}`);

    const missingKeys = findMissingKeys(baseline, target, locale);
    console.log(`   ⚠️ Missing keys: ${missingKeys.length}`);

    const gapPercentage = ((missingKeys.length / baselineKeys) * 100).toFixed(1);
    console.log(`   📊 Gap: ${gapPercentage}%\n`);

    const stats = generateStats(missingKeys);

    const jsonPath = generateJSONReport(locale, missingKeys, stats);
    console.log(`   ✓ JSON report: ${path.relative(process.cwd(), jsonPath)}`);

    const mdPath = generateMarkdownReport(locale, missingKeys, stats);
    console.log(`   ✓ Markdown report: ${path.relative(process.cwd(), mdPath)}\n`);
  });

  console.log('✅ Extraction complete!\n');
  console.log('📋 Next steps:');
  console.log('   1. Review reports in the reports/ directory');
  console.log('   2. Share translator task briefs (docs/ui/Translation_Task_*.md)');
  console.log('   3. Run validation after translations: npm run i18n:validate\n');
}

// Execute
if (require.main === module) {
  main();
}

module.exports = { flattenJSON, findMissingKeys, categorizeKey };
