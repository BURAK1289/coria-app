# CORIA Storybook Setup

This directory contains Storybook configuration for the CORIA website icon system.

## Installation

Install Storybook and required dependencies:

```bash
npm install --save-dev @storybook/nextjs@latest @storybook/addon-links@latest @storybook/addon-essentials@latest @storybook/addon-onboarding@latest @storybook/addon-interactions@latest @storybook/addon-a11y@latest storybook@latest
```

## Configuration Files

- **`main.ts`** - Main Storybook configuration (stories, addons, webpack)
- **`preview.ts`** - Global decorators, parameters, and theme setup

## Running Storybook

### Development Mode

```bash
npm run storybook
```

This will start Storybook on http://localhost:6006

### Build for Production

```bash
npm run build-storybook
```

This creates a static build in `storybook-static/`

## Package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## Features

### Configured Addons

1. **@storybook/addon-links** - Link stories together
2. **@storybook/addon-essentials** - Essential Storybook addons:
   - Controls: Interactive controls for component args
   - Actions: Display actions in the UI
   - Viewport: Test responsive designs
   - Backgrounds: Change background colors
   - Toolbars: Custom toolbar buttons
   - Docs: Auto-generated documentation
3. **@storybook/addon-a11y** - Accessibility testing
4. **@storybook/addon-interactions** - Test user interactions

### Configuration Highlights

**Webpack Alias:**
- Configured `@/` alias to resolve to `src/` directory
- Matches Next.js path resolution

**Static Files:**
- Public directory configured for asset access
- Icons and images available in stories

**Background Options:**
- Light (default)
- Dark
- CORIA Primary (green)

## Icon Stories

The Icon component stories are located at:
```
src/stories/Icon.stories.tsx
```

### Features

- ✅ Interactive icon gallery with search
- ✅ Category-based filtering (6 categories)
- ✅ 78 icons showcased
- ✅ Accessibility examples
- ✅ Color theming examples
- ✅ Usage pattern demonstrations
- ✅ Size comparison
- ✅ Full documentation

## Documentation

For complete icon documentation, see:
- [Icon Catalog Guide](../docs/ui/Icon_Catalog_Guide.md)
- [Icon Build Pipeline](../claudedocs/Icon_Build_Pipeline.md)
- [Phase 3.3 Migration Report](../claudedocs/phase-3-3-icon-migration-report.md)

## Troubleshooting

### Module Resolution Errors

If you encounter module resolution errors:

1. Verify the webpack alias configuration in `main.ts`
2. Ensure `tsconfig.json` has correct path mappings
3. Restart Storybook after config changes

### Build Failures

If builds fail:

1. Clear Storybook cache: `rm -rf node_modules/.cache/storybook`
2. Reinstall dependencies: `npm ci`
3. Check for TypeScript errors: `npm run type-check`

### Port Already in Use

If port 6006 is in use:

```bash
# Use different port
storybook dev -p 6007
```

## Best Practices

1. **Story Organization**
   - Group related stories by component
   - Use clear, descriptive story names
   - Include usage examples

2. **Documentation**
   - Add descriptions to stories
   - Document props with argTypes
   - Include accessibility notes

3. **Accessibility**
   - Use the a11y addon for testing
   - Ensure proper ARIA attributes
   - Test with different backgrounds

4. **Performance**
   - Keep story count reasonable
   - Avoid large data sets in stories
   - Use lazy loading where appropriate

## Deployment

### Static Deployment

Build and deploy to static hosting:

```bash
npm run build-storybook
# Deploy storybook-static/ to hosting provider
```

### Chromatic (Recommended)

For visual regression testing:

```bash
npm install --save-dev chromatic
npx chromatic --project-token=<your-project-token>
```

## Support

For issues or questions:
1. Check [Storybook documentation](https://storybook.js.org/docs)
2. Review [Next.js Storybook guide](https://storybook.js.org/recipes/@storybook/nextjs)
3. Consult CORIA icon documentation

---

**Last Updated:** 2025-01-13
**Storybook Version:** Latest
**Framework:** Next.js 15.5.3
