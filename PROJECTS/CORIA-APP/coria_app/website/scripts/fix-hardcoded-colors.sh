#!/bin/bash

# CORIA Color Migration Script
# Replaces hardcoded hex colors with design system variables

set -e  # Exit on error

echo "🎨 CORIA Color Migration Script"
echo "================================"
echo ""

# Backup files before modification
echo "📦 Creating backup..."
mkdir -p backups
BACKUP_DIR="backups/src-$(date +%Y%m%d-%H%M%S)"
cp -r src "$BACKUP_DIR"
echo "   Backup created at: $BACKUP_DIR"

# Function to replace colors in a file
replace_colors() {
  local file=$1
  echo "🔧 Processing: $file"

  # Text colors
  sed -i '' 's/text-\[#1B5E3F\]/text-coria-primary/g' "$file"
  sed -i '' 's/text-\[#0D3B2F\]/text-coria-primary-dark/g' "$file"
  sed -i '' 's/text-\[#66BB6A\]/text-acik-yesil/g' "$file"
  sed -i '' 's/text-\[#7FB069\]/text-leaf/g' "$file"
  sed -i '' 's/text-\[#26A69A\]/text-su-yesili/g' "$file"
  sed -i '' 's/text-\[#FF6B6B\]/text-mercan/g' "$file"
  sed -i '' 's/text-\[#8D6E63\]/text-toprak/g' "$file"
  sed -i '' 's/text-\[#2C2C2C\]/text-koyu-gri/g' "$file"

  # Background colors
  sed -i '' 's/bg-\[#1B5E3F\]/bg-coria-primary/g' "$file"
  sed -i '' 's/bg-\[#0D3B2F\]/bg-coria-primary-dark/g' "$file"
  sed -i '' 's/bg-\[#66BB6A\]/bg-acik-yesil/g' "$file"
  sed -i '' 's/bg-\[#7FB069\]/bg-leaf/g' "$file"
  sed -i '' 's/bg-\[#26A69A\]/bg-su-yesili/g' "$file"
  sed -i '' 's/bg-\[#F5F5F5\]/bg-acik-gri/g' "$file"
  sed -i '' 's/bg-\[#F8F9FA\]/bg-acik-gri/g' "$file"
  sed -i '' 's/bg-\[#87CEEB\]/bg-sky/g' "$file"
  sed -i '' 's/bg-\[#C5D86D\]/bg-lime/g' "$file"
  sed -i '' 's/bg-\[#FFD93D\]/bg-gold/g' "$file"

  # Border colors
  sed -i '' 's/border-\[#1B5E3F\]/border-coria-primary/g' "$file"
  sed -i '' 's/border-\[#0D3B2F\]/border-coria-primary-dark/g' "$file"

  # Gradients - simple patterns
  sed -i '' 's/from-\[#1B5E3F\]/from-coria-primary/g' "$file"
  sed -i '' 's/to-\[#1B5E3F\]/to-coria-primary/g' "$file"
  sed -i '' 's/via-\[#1B5E3F\]/via-coria-primary/g' "$file"
  sed -i '' 's/from-\[#0D3B2F\]/from-coria-primary-dark/g' "$file"
  sed -i '' 's/to-\[#0D3B2F\]/to-coria-primary-dark/g' "$file"
  sed -i '' 's/from-\[#7FB069\]/from-leaf/g' "$file"
  sed -i '' 's/to-\[#7FB069\]/to-leaf/g' "$file"
  sed -i '' 's/via-\[#7FB069\]/via-leaf/g' "$file"
  sed -i '' 's/from-\[#87CEEB\]/from-sky/g' "$file"
  sed -i '' 's/via-\[#87CEEB\]/via-sky/g' "$file"
  sed -i '' 's/from-\[#C5D86D\]/from-lime/g' "$file"
  sed -i '' 's/via-\[#C5D86D\]/via-lime/g' "$file"
  sed -i '' 's/from-\[#FFD93D\]/from-gold/g' "$file"
  sed -i '' 's/to-\[#F8F9FA\]/to-acik-gri/g' "$file"

  # Shadow colors
  sed -i '' 's/shadow-\[#1B5E3F\]/shadow-coria-primary/g' "$file"

  # Ring colors - handle rgba separately
  sed -i '' 's/ring-\[rgba(27,94,63,0\.08)\]/ring-coria-primary\/8/g' "$file"
  sed -i '' 's/ring-\[rgba(27,94,63,0\.18)\]/ring-coria-primary\/18/g' "$file"
}

# Process all component files
echo ""
echo "🔍 Finding files to process..."
files=$(find src/components src/app -type f -name "*.tsx" ! -path "*/node_modules/*")

for file in $files; do
  replace_colors "$file"
done

# Special handling for blog components (inline styles)
echo ""
echo "🎨 Processing inline styles in blog components..."
for file in src/components/blog/*.tsx; do
  if [ -f "$file" ]; then
    sed -i '' "s/|| '#1B5E3F'/|| 'var(--coria-primary)'/g" "$file"
  fi
done

# Verify replacements
echo ""
echo "🔍 Verifying replacements..."
remaining=$(grep -r "#1B5E3F\|#0D3B2F\|#7FB069\|#F8F9FA\|#87CEEB\|#C5D86D\|#FFD93D" src/ --include="*.tsx" --exclude-dir=node_modules 2>/dev/null | wc -l)
echo "   Remaining hardcoded colors: $remaining"

if [ "$remaining" -gt 10 ]; then
  echo "⚠️  Warning: More than 10 hardcoded colors remain (expected < 5 for meta tags)"
  echo "   Manual review required:"
  grep -r "#1B5E3F\|#0D3B2F\|#7FB069\|#F8F9FA\|#87CEEB\|#C5D86D\|#FFD93D" src/ --include="*.tsx" --exclude-dir=node_modules 2>/dev/null
else
  echo "✅ Color migration completed successfully!"
  echo "   Only meta tags and manifests should retain hex values."
fi

echo ""
echo "📋 Next steps:"
echo "   1. Review git diff to verify changes"
echo "   2. Test light/dark theme switching"
echo "   3. Run: npm run lint"
echo "   4. Run: npm run test"
echo "   5. Commit changes: git commit -m 'refactor: migrate hardcoded colors to design system'"
echo ""
echo "💾 Backup location: $BACKUP_DIR"
