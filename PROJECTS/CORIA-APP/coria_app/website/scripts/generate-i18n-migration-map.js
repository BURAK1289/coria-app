#!/usr/bin/env node

/**
 * I18N Migration Key Mapper
 *
 * Generates key mapping for hardcoded Turkish strings based on context
 * Creates migration plan with suggested key names following pages.* and common.* conventions
 */

const fs = require('fs');
const path = require('path');

// Load hardcoded strings scan results
const scanReport = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../docs/ui/hardcoded-strings-scan.json'), 'utf-8')
);

// Load existing tr.json to understand current structure
const existingKeys = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/messages/tr.json'), 'utf-8')
);

// Key generation rules based on file location
const keyGenerationRules = {
  'app/[locale]/about/page.tsx': (string, context) => {
    if (context.includes('year:')) return 'pages.about.timeline';
    if (context.includes('description:')) return 'pages.about.partnerships';
    return 'pages.about.content';
  },
  'app/[locale]/foundation/page.tsx': (string, context) => {
    if (context.includes('subtitle:')) return 'pages.foundation.hero.subtitle';
    if (context.includes('description:')) return 'pages.foundation.features';
    if (context.includes('title:') && context.includes('project')) return 'pages.foundation.projects';
    if (context.includes('items:')) return 'pages.foundation.roadmap';
    return 'pages.foundation.content';
  },
  'app/[locale]/pricing/page.tsx': (string, context) => {
    return 'pages.pricing.content';
  },
  'app/[locale]/contact/page.tsx': (string, context) => {
    return 'pages.contact.content';
  },
  'app/[locale]/layout.tsx': (string, context) => {
    if (context.includes('title')) return 'common.meta.title';
    if (context.includes('description')) return 'common.meta.description';
    if (context.includes('[')) return 'common.meta.keywords';
    return 'common.meta';
  },
  'components/layout/footer.tsx': (string, context) => {
    return 'navigation.footer';
  },
  'components/sections/hero-section.tsx': (string, context) => {
    if (context.includes('eyebrow:')) return 'hero.badge';
    if (context.includes('title:')) return 'hero.title';
    if (context.includes('subtitle:')) return 'hero.subtitle';
    if (context.includes('label:') && context.includes('İndir')) return 'hero.cta';
    if (context.includes('value:')) return 'hero.stats';
    if (context.includes('aria-label')) return 'common.aria';
    return 'hero.content';
  },
  'components/sections/features-showcase.tsx': (string, context) => {
    if (context.includes('title:')) return 'features.list';
    if (context.includes('description:')) return 'features.descriptions';
    if (context.includes('aria-label')) return 'common.aria.features';
    return 'features.content';
  }
};

// Common patterns for key naming
function generateKeyName(fileMatch, context) {
  // Clean the string for key generation
  const cleanString = context
    .replace(/[^\wçğıİöşü\s]/gi, '')
    .trim()
    .slice(0, 50);

  // Convert to camelCase
  const camelCase = cleanString
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  return camelCase;
}

// Generate migration map
const migrationMap = {
  byFile: {},
  byKey: {},
  summary: {
    totalStrings: scanReport.summary.totalStrings,
    pagesKeys: 0,
    commonKeys: 0,
    generatedKeys: 0
  }
};

// Process each file
Object.entries(scanReport.byFile).forEach(([file, findings]) => {
  migrationMap.byFile[file] = {
    totalStrings: findings.length,
    migrations: []
  };

  findings.forEach((finding) => {
    const { string, line, category, context } = finding;

    // Determine base key path
    let baseKey = 'common.ui';

    // Check if we have a rule for this file
    for (const [filePattern, rule] of Object.entries(keyGenerationRules)) {
      if (file.includes(filePattern.replace('app/[locale]/', 'app/[locale]/'))) {
        baseKey = rule(string, context);
        break;
      }
    }

    // Generate specific key name
    const keyName = generateKeyName(string, string);
    const fullKey = `${baseKey}.${keyName}`;

    // Create migration entry
    const migration = {
      line,
      category,
      originalString: string,
      suggestedKey: fullKey,
      context: context.substring(0, 80) + '...',
      // Generate replacement pattern
      replacement: category === 'ui'
        ? `{t('${fullKey}')}`
        : category === 'aria'
        ? `aria-label={t('${fullKey}')}`
        : category === 'alt'
        ? `alt={t('${fullKey}')}`
        : category === 'title'
        ? `title={t('${fullKey}')}`
        : `placeholder={t('${fullKey}')}`
    };

    migrationMap.byFile[file].migrations.push(migration);

    // Add to byKey index
    if (!migrationMap.byKey[fullKey]) {
      migrationMap.byKey[fullKey] = {
        originalString: string,
        files: [],
        category
      };
    }
    migrationMap.byKey[fullKey].files.push({ file, line });

    // Update summary
    if (baseKey.startsWith('pages.')) {
      migrationMap.summary.pagesKeys++;
    } else if (baseKey.startsWith('common.')) {
      migrationMap.summary.commonKeys++;
    }
    migrationMap.summary.generatedKeys++;
  });
});

// Generate locale file updates
const localeUpdates = {
  tr: {},
  en: {},  // Will need English translations
  de: {},  // Will need German translations
  fr: {}   // Will need French translations
};

// Build nested structure for locale files
Object.entries(migrationMap.byKey).forEach(([key, data]) => {
  const parts = key.split('.');
  let current = localeUpdates.tr;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }

  current[parts[parts.length - 1]] = data.originalString;

  // Add placeholders for other locales
  ['en', 'de', 'fr'].forEach(locale => {
    let current = localeUpdates[locale];
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = `[${locale.toUpperCase()}] ${data.originalString}`;
  });
});

// Write migration map
fs.writeFileSync(
  path.join(__dirname, '../docs/ui/i18n-migration-map.json'),
  JSON.stringify(migrationMap, null, 2)
);

// Write locale updates
fs.writeFileSync(
  path.join(__dirname, '../docs/ui/locale-updates-tr.json'),
  JSON.stringify(localeUpdates.tr, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, '../docs/ui/locale-updates-en.json'),
  JSON.stringify(localeUpdates.en, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, '../docs/ui/locale-updates-de.json'),
  JSON.stringify(localeUpdates.de, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, '../docs/ui/locale-updates-fr.json'),
  JSON.stringify(localeUpdates.fr, null, 2)
);

// Generate migration report
console.log('\n' + '='.repeat(80));
console.log('🗺️  I18N MIGRATION KEY MAPPING REPORT');
console.log('='.repeat(80) + '\n');

console.log('📊 SUMMARY');
console.log(`Total Strings to Migrate: ${migrationMap.summary.totalStrings}`);
console.log(`Pages Keys Generated: ${migrationMap.summary.pagesKeys}`);
console.log(`Common Keys Generated: ${migrationMap.summary.commonKeys}`);
console.log(`Total Unique Keys: ${migrationMap.summary.generatedKeys}\n`);

console.log('📁 FILES TO MIGRATE:\n');
Object.entries(migrationMap.byFile).forEach(([file, data]) => {
  console.log(`  📄 ${file}: ${data.totalStrings} strings`);
});

console.log('\n✅ Migration artifacts generated:');
console.log('  - docs/ui/i18n-migration-map.json (full migration plan)');
console.log('  - docs/ui/locale-updates-{tr,en,de,fr}.json (locale file updates)\n');

console.log('🎯 Next Steps:');
console.log('  1. Review generated key names in i18n-migration-map.json');
console.log('  2. Merge locale-updates-*.json into src/messages/*.json');
console.log('  3. Run migration script to replace hardcoded strings');
console.log('  4. Validate with npm run i18n:validate\n');
