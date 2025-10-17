const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Scan for hardcoded strings in TSX/TS files
const srcDir = path.join(__dirname, '../src');

// Patterns to detect hardcoded text
const patterns = {
  hardcodedJSX: /<[^>]*>([A-Z][a-zğüşöçıİ]{3,}(\s+[a-zğüşöçıİA-Z]+)+)<\/[^>]*>/g,
  hardcodedString: /["'`]([A-Z][a-zğüşöçıİ]{4,}(\s+[a-zğüşöçıİA-Z]+){2,})["'`]/g,
  validI18n: /[ut]\(['"][\w.]+['"]\)/g, // t('key') or useTranslations('key')
};

// Exclude patterns
const exclude = [
  'node_modules',
  '.next',
  'test',
  'types',
  '.test.',
  '.spec.',
  'stories',
];

function shouldExclude(filePath) {
  return exclude.some(pattern => filePath.includes(pattern));
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const findings = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Skip lines with valid i18n usage
    if (patterns.validI18n.test(line)) {
      return;
    }

    // Check for hardcoded JSX text
    let match;
    patterns.hardcodedJSX.lastIndex = 0;
    while ((match = patterns.hardcodedJSX.exec(line)) !== null) {
      const text = match[1].trim();
      // Filter out obvious false positives
      if (text.length > 10 && !text.includes('http') && !text.includes('@')) {
        findings.push({
          file: filePath,
          line: lineNum,
          text: text.substring(0, 50),
          context: line.trim().substring(0, 100),
          type: 'jsx'
        });
      }
    }

    // Check for hardcoded strings
    patterns.hardcodedString.lastIndex = 0;
    while ((match = patterns.hardcodedString.exec(line)) !== null) {
      const text = match[1].trim();
      if (text.length > 10 && !text.includes('http') && !text.includes('@') && !text.includes('\\')) {
        findings.push({
          file: filePath,
          line: lineNum,
          text: text.substring(0, 50),
          context: line.trim().substring(0, 100),
          type: 'string'
        });
      }
    }
  });

  return findings;
}

function main() {
  console.log('🔍 Scanning for hardcoded strings...\n');

  const files = glob.sync(`${srcDir}/**/*.{tsx,ts}`, {
    ignore: ['**/node_modules/**', '**/.next/**', '**/test/**']
  });

  const allFindings = [];
  let scannedFiles = 0;

  files.forEach(file => {
    if (shouldExclude(file)) return;

    const findings = scanFile(file);
    if (findings.length > 0) {
      allFindings.push(...findings);
    }
    scannedFiles++;
  });

  console.log(`📊 Scanned ${scannedFiles} files\n`);
  console.log(`⚠️  Found ${allFindings.length} potential hardcoded strings\n`);

  // Group by file
  const byFile = {};
  allFindings.forEach(finding => {
    const relPath = path.relative(srcDir, finding.file);
    if (!byFile[relPath]) byFile[relPath] = [];
    byFile[relPath].push(finding);
  });

  // Print results
  Object.entries(byFile).forEach(([file, findings]) => {
    console.log(`📄 ${file}`);
    findings.forEach(f => {
      console.log(`   Line ${f.line}: ${f.text}`);
      console.log(`   → ${f.context.substring(0, 80)}...`);
    });
    console.log();
  });

  // Save detailed report
  fs.writeFileSync(
    path.join(__dirname, 'i18n-hardcoded-report.json'),
    JSON.stringify({ total: allFindings.length, findings: allFindings }, null, 2)
  );

  console.log('✅ Report saved to scripts/i18n-hardcoded-report.json');
}

try {
  main();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
