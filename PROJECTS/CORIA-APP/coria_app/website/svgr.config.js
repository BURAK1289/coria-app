/**
 * SVGR Configuration for CORIA Icon System
 *
 * Transforms optimized SVG files into TypeScript React components
 * with proper typing, accessibility, and design system integration.
 *
 * Output format matches CORIA icon component standards:
 * - TypeScript with proper typing
 * - Size prop for flexible sizing
 * - Title and aria attributes for accessibility
 * - currentColor for theming
 * - Comprehensive JSDoc documentation
 */

module.exports = {
  // TypeScript output
  typescript: true,

  // Use React 17+ JSX transform (no need to import React)
  jsxRuntime: 'automatic',

  // Generate named exports (e.g., export function SearchIcon)
  exportType: 'named',

  // Add .tsx extension
  outDir: 'src/components/icons/svg/core',

  // File naming convention
  filenameCase: 'kebab', // icon-search.tsx

  // Template for generating React components
  template: (variables, { tpl }) => {
    return tpl`
${variables.imports};
import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
}

${variables.interfaces};

/**
 * ${variables.componentName} - ${variables.iconDescription || 'Icon component'}
 *
 * Design: Outline style, 24×24 grid, 1.75px stroke
 * Use case: ${variables.useCase || 'General purpose icon'}
 */
${variables.functionDeclaration} {
  const {
    size = 24,
    title,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    ...props
  } = ${variables.props};

  return (
    ${variables.jsx}
  );
}
`;
  },

  // SVG props configuration
  svgProps: {
    width: '{size}',
    height: '{size}',
    role: "{ariaHidden ? undefined : 'img'}",
    'aria-label': '{ariaLabel}',
    'aria-hidden': '{ariaHidden}',
  },

  // Replace attribute values
  replaceAttrValues: {
    '#000': 'currentColor',
    '#000000': 'currentColor',
    'black': 'currentColor',
  },

  // Plugins
  plugins: [
    '@svgr/plugin-svgo',      // SVGO optimization
    '@svgr/plugin-jsx',       // JSX transformation
    '@svgr/plugin-prettier',  // Code formatting
  ],

  // SVGO configuration (runs before SVGR)
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
            convertShapeToPath: false,
            mergePaths: false,
          },
        },
      },
      {
        name: 'addAttributesToSVGElement',
        params: {
          attributes: [
            { fill: 'none' },
            { stroke: 'currentColor' },
            { 'stroke-width': '1.75' },
            { 'stroke-linecap': 'round' },
            { 'stroke-linejoin': 'round' },
          ],
        },
      },
    ],
  },

  // Prettier configuration for generated code
  prettierConfig: {
    parser: 'typescript',
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    tabWidth: 2,
    printWidth: 80,
  },

  // Index file generation
  indexTemplate: (filePaths) => {
    const exportEntries = filePaths.map((filePath) => {
      const basename = filePath.path.split('/').pop().replace('.tsx', '');
      const componentName = basename
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'Icon';

      return `export { ${componentName} } from './${basename}';`;
    });

    return `/**
 * CORIA Icon System - Core Icons
 *
 * Auto-generated exports from SVGR build pipeline.
 * Do not edit manually - run 'npm run icons:build' to regenerate.
 *
 * Generated: ${new Date().toISOString()}
 */

${exportEntries.join('\n')}
`;
  },
};
