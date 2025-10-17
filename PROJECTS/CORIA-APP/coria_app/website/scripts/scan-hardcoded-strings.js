#!/usr/bin/env node

/**
 * Hardcoded String Scanner for i18n Migration
 *
 * Scans website/src for hardcoded Turkish strings that need i18n migration
 * Outputs: file:line mapping with categorization (UI text, aria, alt, title, placeholder)
 */

const fs = require('fs');
const path = require('path');

// Turkish character patterns for detection
const TURKISH_PATTERNS = [
  // Turkish-specific letters
  /[çÇğĞıİöÖşŞüÜ]/,
  // Common Turkish words
  /(hakkımızda|iletişim|özellikler|fiyatlandırma|blog|giriş|kayıt|çıkış|ara|gönder|iptal|kaydet|sil|düzenle|yeni|ekle|kaldır|onayla|reddet|başla|bitir|devam|geri|ileri|sonraki|önceki|tümü|hiçbiri|seç|yükle|indir|paylaş|beğen|yorum|yanıt|göster|gizle|aç|kapat|tamam|evet|hayır|belki|lütfen|teşekkürler|özür|merhaba|güle güle)/i,
  // Turkish phrases
  /(daha fazla|devamını oku|tümünü gör|daha az|geri dön|anasayfa|başlangıç|son|önceki sayfa|sonraki sayfa|sayfa bulunamadı|hata oluştu|yükleniyor|lütfen bekleyin)/i
];

// Exclude patterns (already i18n'd, imports, etc.)
const EXCLUDE_PATTERNS = [
  /^import\s/,
  /^export\s/,
  /from\s+['"`]/,
  /require\s*\(/,
  /t\(['"`]/,  // Already using translation
  /useTranslations\(/,  // i18n hook
  /console\.(log|warn|error)/,  // Console logs
  /className\s*=\s*['"`]/,  // CSS classes
  /\/\//,  // Comments
  /\/\*/,  // Block comments
];

// Categorization patterns
const CATEGORIES = {
  aria: /aria-label\s*=\s*['"`]([^'"`]+)['"`]/g,
  alt: /alt\s*=\s*['"`]([^'"`]+)['"`]/g,
  title: /title\s*=\s*['"`]([^'"`]+)['"`]/g,
  placeholder: /placeholder\s*=\s*['"`]([^'"`]+)['"`]/g,
  ui: null  // default category
};

const results = {
  byCategory: {
    ui: [],
    aria: [],
    alt: [],
    title: [],
    placeholder: []
  },
  byFile: {},
  summary: {
    totalFiles: 0,
    totalStrings: 0,
    byCategory: {}
  }
};

function hasTurkishContent(text) {
  return TURKISH_PATTERNS.some(pattern => pattern.test(text));
}

function shouldExclude(line) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(line));
}

function categorizeString(line, lineNumber, filePath, match) {
  // Check each category pattern
  for (const [category, pattern] of Object.entries(CATEGORIES)) {
    if (!pattern) continue;

    const matches = line.matchAll(pattern);
    for (const m of matches) {
      if (hasTurkishContent(m[1])) {
        return {
          category,
          string: m[1],
          line: lineNumber,
          file: filePath,
          context: line.trim()
        };
      }
    }
  }

  // Default UI category - look for strings in JSX
  const jsxStringPatterns = [
    />([^<>{}\s]+[çÇğĞıİöÖşŞüÜ][^<>{}]*)</g,  // Between JSX tags
    /['"`]([^'"`]*[çÇğĞıİöÖşŞüÜ][^'"`]*)['"`]/g  // In quotes
  ];

  for (const pattern of jsxStringPatterns) {
    const matches = line.matchAll(pattern);
    for (const m of matches) {
      if (hasTurkishContent(m[1]) && !shouldExclude(line)) {
        return {
          category: 'ui',
          string: m[1].trim(),
          line: lineNumber,
          file: filePath,
          context: line.trim()
        };
      }
    }
  }

  return null;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const findings = [];

  lines.forEach((line, index) => {
    if (shouldExclude(line)) return;
    if (!hasTurkishContent(line)) return;

    const finding = categorizeString(line, index + 1, filePath, line);
    if (finding) {
      findings.push(finding);
    }
  });

  return findings;
}

function scanDirectory(dirPath, baseDir = dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules, .next, test directories
      if (['node_modules', '.next', 'dist', 'build'].includes(entry.name)) {
        continue;
      }
      scanDirectory(fullPath, baseDir);
    } else if (entry.isFile()) {
      // Only scan TypeScript/JavaScript/TSX/JSX files
      if (!/\.(tsx?|jsx?)$/.test(entry.name)) continue;

      const findings = scanFile(fullPath);
      if (findings.length > 0) {
        const relativePath = path.relative(baseDir, fullPath);

        results.byFile[relativePath] = findings;
        results.summary.totalFiles++;

        findings.forEach(finding => {
          results.byCategory[finding.category].push({
            ...finding,
            file: relativePath
          });
          results.summary.totalStrings++;
        });
      }
    }
  }
}

function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 HARDCODED TURKISH STRING SCAN REPORT');
  console.log('='.repeat(80) + '\n');

  console.log('📊 SUMMARY');
  console.log(`Total Files with Hardcoded Strings: ${results.summary.totalFiles}`);
  console.log(`Total Hardcoded Strings Found: ${results.summary.totalStrings}\n`);

  console.log('📂 BY CATEGORY:\n');
  for (const [category, items] of Object.entries(results.byCategory)) {
    console.log(`  ${category.toUpperCase()}: ${items.length} strings`);
  }

  console.log('\n' + '-'.repeat(80));
  console.log('📝 DETAILED FINDINGS BY CATEGORY');
  console.log('-'.repeat(80) + '\n');

  for (const [category, items] of Object.entries(results.byCategory)) {
    if (items.length === 0) continue;

    console.log(`\n🏷️  ${category.toUpperCase()} (${items.length} instances)\n`);

    // Group by file
    const byFile = {};
    items.forEach(item => {
      if (!byFile[item.file]) byFile[item.file] = [];
      byFile[item.file].push(item);
    });

    for (const [file, fileItems] of Object.entries(byFile)) {
      console.log(`  📄 ${file}`);
      fileItems.forEach(item => {
        console.log(`     Line ${item.line}: "${item.string}"`);
        console.log(`     Context: ${item.context.substring(0, 100)}...`);
      });
      console.log();
    }
  }

  // Generate JSON report for programmatic use
  const jsonReport = {
    generated: new Date().toISOString(),
    summary: results.summary,
    byCategory: results.byCategory,
    byFile: results.byFile
  };

  fs.writeFileSync(
    path.join(__dirname, '../docs/ui/hardcoded-strings-scan.json'),
    JSON.stringify(jsonReport, null, 2)
  );

  console.log('\n✅ JSON report saved to: docs/ui/hardcoded-strings-scan.json\n');
}

// Main execution
const srcPath = path.join(__dirname, '../src');
console.log(`Scanning directory: ${srcPath}\n`);

scanDirectory(srcPath);
generateReport();

// Exit with error code if strings found
process.exit(results.summary.totalStrings > 0 ? 1 : 0);
