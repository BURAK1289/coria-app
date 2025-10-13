# Icon Build Pipeline - Quick Start Guide

**Status**: ✅ Ready for Use
**Last Updated**: 2025-10-12

---

## 🚀 Quick Commands

```bash
# Install dependencies (first time only)
npm install

# Build all icons (SVGO → SVGR)
npm run icons:build

# Watch mode (rebuild on changes)
npm run icons:watch

# Check icon inventory and validation
npm run icons:check

# CI validation (exits 1 on errors)
npm run icons:validate
```

---

## 📁 Directory Structure

```
src/components/icons/svg/
├── source/       # ← Add your raw SVG files here
├── optimized/    # ← SVGO output (auto-generated)
└── core/         # ← React components (final output)
```

---

## ➕ Adding a New Icon

1. **Export SVG** from design tool (Figma, Sketch, etc.)
   - 24×24px grid
   - 1.75px stroke, round caps/joins
   - Name: `icon-{name}.svg` (kebab-case)

2. **Place in source/**
   ```bash
   cp icon-new-feature.svg src/components/icons/svg/source/
   ```

3. **Build**
   ```bash
   npm run icons:build
   ```

4. **Use in code**
   ```tsx
   import { Icon } from '@/components/icons/Icon';

   <Icon name="new-feature" size={24} />
   ```

5. **Validate**
   ```bash
   npm run icons:check
   ```

---

## 🔍 Checking Icon Status

```bash
# Full report (usage, sizes, migration progress)
npm run icons:check

# JSON output (for automation)
npm run icons:check -- --json > report.json

# CI mode (GitHub Actions compatible)
npm run icons:validate
```

**Output Includes**:
- Total icons, sizes, average size
- Used vs unused icons
- Migration progress (lucide-react → Icon component)
- Integrity validation (duplicates, naming, file sizes)

---

## 🛠️ Troubleshooting

### Issue: "No SVG files found"
**Solution**: Add SVG files to `src/components/icons/svg/source/`

### Issue: "SVGO not found"
**Solution**: Run `npm install`

### Issue: Large file warning
**Solution**: Simplify SVG or split into multiple icons

---

## 📖 Full Documentation

See [Icon_Build_Pipeline.md](./Icon_Build_Pipeline.md) for complete documentation:
- Configuration details (svgo.config.js, svgr.config.js)
- CI/CD integration (GitHub Actions)
- Design specifications
- Best practices
- Advanced troubleshooting

---

## ✅ Phase 5 Deliverables

**Created Files**:
- ✅ `svgo.config.js` - SVGO optimization configuration
- ✅ `svgr.config.js` - SVGR React component generation
- ✅ `scripts/icons-build.mjs` - Build pipeline (422 lines)
- ✅ `scripts/icons-check.mjs` - Inventory tool (422 lines)
- ✅ `docs/ui/Icon_Build_Pipeline.md` - Full documentation (630+ lines)
- ✅ `package.json` - Updated with 4 new scripts + 6 dependencies

**npm Scripts**:
- ✅ `icons:build` - Full build pipeline
- ✅ `icons:check` - Inventory and validation
- ✅ `icons:watch` - Watch mode
- ✅ `icons:validate` - CI validation

---

**Ready to Use**: Run `npm install && npm run icons:build` to get started! 🎉
