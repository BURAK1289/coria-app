/**
 * SVGO Configuration for CORIA Icon System
 *
 * Optimizes SVG files while preserving critical attributes:
 * - stroke and stroke-width for outline style
 * - strokeLinecap and strokeLinejoin for visual consistency
 * - viewBox for proper scaling
 *
 * Design specifications:
 * - 24×24px grid
 * - 1.75px ± 0.25 stroke width
 * - Round caps and joins
 * - currentColor for theming
 */

module.exports = {
  multipass: true, // Multiple optimization passes for maximum compression

  plugins: [
    // Remove unnecessary elements and attributes
    {
      name: 'preset-default',
      params: {
        overrides: {
          // CRITICAL: Preserve stroke attributes
          removeUnknownsAndDefaults: {
            keepRoleAttr: true,
            keepAriaAttrs: true,
          },

          // CRITICAL: Do not remove viewBox (required for scaling)
          removeViewBox: false,

          // CRITICAL: Do not convert stroke to fill (outline style)
          convertShapeToPath: false,

          // CRITICAL: Do not merge paths (breaks stroke rendering)
          mergePaths: false,

          // Keep dimensions for proper sizing
          removeDimensions: false,
        },
      },
    },

    // Remove comments and metadata
    'removeComments',
    'removeDesc',
    'removeTitle', // React component will add <title> programmatically
    'removeMetadata',
    'removeEditorsNSData',

    // Clean up attributes
    {
      name: 'removeAttrs',
      params: {
        attrs: [
          'data-*',           // Remove data attributes
          'class',            // Remove CSS classes
          'style',            // Remove inline styles
          'id',               // Remove IDs
          'sketch:*',         // Remove Sketch metadata
          'figma:*',          // Remove Figma metadata
        ],
      },
    },

    // CRITICAL: Preserve stroke attributes
    {
      name: 'removeUnknownsAndDefaults',
      params: {
        defaultAttrs: false, // Keep all attributes
        keepRoleAttr: true,
        keepAriaAttrs: true,
      },
    },

    // CRITICAL: Add/normalize stroke attributes for consistency
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          { xmlns: 'http://www.w3.org/2000/svg' },
          { fill: 'none' },                        // Outline style
          { stroke: 'currentColor' },              // Themeable color
          { 'stroke-width': '1.75' },              // Design spec
          { 'stroke-linecap': 'round' },           // Round caps
          { 'stroke-linejoin': 'round' },          // Round joins
        ],
      },
    },

    // Sort attributes for consistency
    'sortAttrs',

    // Round numbers to 2 decimal places
    {
      name: 'cleanupNumericValues',
      params: {
        floatPrecision: 2,
      },
    },

    // Convert colors to consistent format
    'convertColors',

    // Remove empty containers
    'removeEmptyContainers',

    // Collapse useless groups
    'collapseGroups',

    // Remove useless defs
    'removeUselessDefs',

    // Clean up paths
    'cleanupListOfValues',
    'cleanupEnableBackground',

    // Remove hidden elements
    'removeHiddenElems',
    'removeEmptyText',

    // Optimize path data
    'convertPathData',

    // Remove useless stroke and fill
    'removeUselessStrokeAndFill',

    // Final cleanup
    'cleanupIds',
    'removeRasterImages', // No raster images in icon SVGs
    'removeScriptElement', // No scripts in icon SVGs
    'removeStyleElement', // No inline styles
  ],

  // JavaScript API options
  js2svg: {
    indent: 2,        // 2-space indentation
    pretty: true,     // Human-readable output
  },
};
