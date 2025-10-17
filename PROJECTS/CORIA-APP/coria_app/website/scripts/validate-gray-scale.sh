#!/bin/bash

# CORIA Gray Scale Validation Script (JIRA-617)
# Validates the implementation of the 10-level gray scale system

set -e

echo "🎨 CORIA Gray Scale Validation Script"
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counter for issues
ISSUES=0

# 1. Check CSS Variables in globals.css
echo "📋 Step 1: Checking CSS Variables in globals.css..."
REQUIRED_VARS=(
  "coria-gray-50"
  "coria-gray-100"
  "coria-gray-200"
  "coria-gray-300"
  "coria-gray-400"
  "coria-gray-500"
  "coria-gray-600"
  "coria-gray-700"
  "coria-gray-800"
  "coria-gray-900"
  "coria-white"
  "coria-black"
)

MISSING_VARS=0
for var in "${REQUIRED_VARS[@]}"; do
  if grep -q "--${var}:" src/app/globals.css; then
    echo -e "${GREEN}✓${NC} --${var} defined"
  else
    echo -e "${RED}✗${NC} --${var} missing"
    MISSING_VARS=$((MISSING_VARS + 1))
    ISSUES=$((ISSUES + 1))
  fi
done

if [ $MISSING_VARS -eq 0 ]; then
  echo -e "${GREEN}✓ All 12 CSS variables defined${NC}"
else
  echo -e "${RED}✗ ${MISSING_VARS} CSS variables missing${NC}"
fi
echo ""

# 2. Check @theme inline mapping
echo "📋 Step 2: Checking @theme inline mapping..."
MISSING_THEME=0
for var in "${REQUIRED_VARS[@]}"; do
  if grep -q "--color-${var}: var(--${var});" src/app/globals.css; then
    echo -e "${GREEN}✓${NC} --color-${var} mapped"
  else
    echo -e "${RED}✗${NC} --color-${var} not mapped in @theme"
    MISSING_THEME=$((MISSING_THEME + 1))
    ISSUES=$((ISSUES + 1))
  fi
done

if [ $MISSING_THEME -eq 0 ]; then
  echo -e "${GREEN}✓ All 12 @theme mappings present${NC}"
else
  echo -e "${RED}✗ ${MISSING_THEME} @theme mappings missing${NC}"
fi
echo ""

# 3. Check for hex value consistency
echo "📋 Step 3: Validating hex color values..."
EXPECTED_COLORS=(
  "coria-gray-50:#FBFAF7"
  "coria-gray-100:#F3EEE4"
  "coria-gray-200:#E8E5E0"
  "coria-gray-300:#D4D0C9"
  "coria-gray-400:#B6B2AA"
  "coria-gray-500:#7A8B7F"
  "coria-gray-600:#5F6F64"
  "coria-gray-700:#46554B"
  "coria-gray-800:#38453C"
  "coria-gray-900:#2C3E34"
  "coria-black:#101713"
  "coria-white:#FFFFFF"
)

COLOR_ERRORS=0
for color_def in "${EXPECTED_COLORS[@]}"; do
  var_name="${color_def%%:*}"
  expected_hex="${color_def##*:}"

  # Extract hex from globals.css (case insensitive)
  actual_hex=$(grep -i "--${var_name}:" src/app/globals.css | grep -oE '#[0-9A-Fa-f]{6}' | head -1 | tr '[:lower:]' '[:upper:]')
  expected_hex_upper=$(echo "$expected_hex" | tr '[:lower:]' '[:upper:]')

  if [ "$actual_hex" == "$expected_hex_upper" ]; then
    echo -e "${GREEN}✓${NC} ${var_name}: ${actual_hex}"
  else
    echo -e "${RED}✗${NC} ${var_name}: expected ${expected_hex_upper}, found ${actual_hex}"
    COLOR_ERRORS=$((COLOR_ERRORS + 1))
    ISSUES=$((ISSUES + 1))
  fi
done

if [ $COLOR_ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ All color values match specification${NC}"
else
  echo -e "${RED}✗ ${COLOR_ERRORS} color mismatches found${NC}"
fi
echo ""

# 4. Check for generic gray usage in components
echo "📋 Step 4: Checking for generic gray usage in components..."
GENERIC_GRAY_FILES=$(grep -r "text-gray-\|bg-gray-\|border-gray-" src/components src/app --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "coria-gray" | grep -v "node_modules" | grep -v ".next" | wc -l | tr -d ' ')

if [ "$GENERIC_GRAY_FILES" -eq "0" ]; then
  echo -e "${GREEN}✓ No generic gray usage found - all components use coria-gray${NC}"
else
  echo -e "${YELLOW}⚠${NC} Found ${GENERIC_GRAY_FILES} instances of generic gray usage"
  echo "   Run: grep -r \"text-gray-\\|bg-gray-\\|border-gray-\" src/ --include=\"*.tsx\" | grep -v \"coria-gray\""
  echo "   to see files that need migration"
fi
echo ""

# 5. Check documentation exists
echo "📋 Step 5: Checking documentation..."
DOCS_MISSING=0

if [ -f "claudedocs/Design_System_Colors_Gray_Scale.md" ]; then
  echo -e "${GREEN}✓${NC} Gray scale documentation exists"
else
  echo -e "${RED}✗${NC} Missing: claudedocs/Design_System_Colors_Gray_Scale.md"
  DOCS_MISSING=$((DOCS_MISSING + 1))
  ISSUES=$((ISSUES + 1))
fi

if [ -f "claudedocs/JIRA-617_Component_Migration_Examples.md" ]; then
  echo -e "${GREEN}✓${NC} Migration examples documentation exists"
else
  echo -e "${RED}✗${NC} Missing: claudedocs/JIRA-617_Component_Migration_Examples.md"
  DOCS_MISSING=$((DOCS_MISSING + 1))
  ISSUES=$((ISSUES + 1))
fi

if [ -f "src/components/examples/gray-scale-showcase.tsx" ]; then
  echo -e "${GREEN}✓${NC} Gray scale showcase component exists"
else
  echo -e "${RED}✗${NC} Missing: src/components/examples/gray-scale-showcase.tsx"
  DOCS_MISSING=$((DOCS_MISSING + 1))
  ISSUES=$((ISSUES + 1))
fi

if [ $DOCS_MISSING -eq 0 ]; then
  echo -e "${GREEN}✓ All documentation files present${NC}"
else
  echo -e "${RED}✗ ${DOCS_MISSING} documentation files missing${NC}"
fi
echo ""

# 6. Summary
echo "========================================="
echo "📊 Validation Summary"
echo "========================================="
echo ""

if [ $ISSUES -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo ""
  echo "JIRA-617 implementation is complete and validated."
  echo ""
  echo "Next steps:"
  echo "  1. View showcase: Open src/components/examples/gray-scale-showcase.tsx in browser"
  echo "  2. Migration guide: Read claudedocs/JIRA-617_Component_Migration_Examples.md"
  echo "  3. Begin migrating components from generic gray to coria-gray"
  exit 0
else
  echo -e "${RED}✗ Found ${ISSUES} issue(s)${NC}"
  echo ""
  echo "Please fix the issues above before marking JIRA-617 as complete."
  exit 1
fi
