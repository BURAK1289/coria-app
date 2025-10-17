import type { Meta, StoryObj } from '@storybook/react';
import { Icon, IconName } from '@/components/icons/Icon';
import { iconMap, getAvailableIcons, searchIcons } from '@/components/icons/icons-map';
import { useState } from 'react';

/**
 * CORIA Icon System
 *
 * Centralized icon library with 78 icons organized by category.
 * All icons support consistent sizing, color theming, and accessibility features.
 *
 * ## Key Features
 * - 🎨 **78 Icons** across 6 categories
 * - 📐 **Consistent Sizing** (16px, 20px, 24px, 32px)
 * - ♿ **Accessible** by default with ARIA support
 * - 🎯 **Type-Safe** with TypeScript autocomplete
 * - 🌳 **Tree-Shakeable** for optimal bundle size
 * - 🎨 **Themeable** with color tokens
 *
 * ## Documentation
 * - [Icon Build Pipeline](../claudedocs/Icon_Build_Pipeline.md)
 * - [Phase 3.3 Migration Report](../claudedocs/phase-3-3-icon-migration-report.md)
 * - [Icon Catalog Guide](../docs/ui/Icon_Catalog_Guide.md)
 */
const meta = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Icon component provides centralized access to all CORIA icons with consistent styling and behavior.

### Basic Usage
\`\`\`tsx
import { Icon } from '@/components/icons/Icon';

// Basic icon
<Icon name="search" />

// With custom size and color
<Icon name="heart" size={32} className="text-coria-primary" />

// Decorative icon (hidden from screen readers)
<Icon name="check" aria-hidden="true" />

// Interactive icon with accessibility
<button aria-label="Close dialog">
  <Icon name="close" aria-hidden="true" />
</button>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: getAvailableIcons(),
      description: 'Icon name from the CORIA icon library',
    },
    size: {
      control: 'select',
      options: [16, 20, 24, 32],
      description: 'Icon size in pixels',
    },
    color: {
      control: 'color',
      description: 'Icon color (defaults to currentColor)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    'aria-hidden': {
      control: 'boolean',
      description: 'Hide from screen readers (for decorative icons)',
    },
    'aria-label': {
      control: 'text',
      description: 'Screen reader label',
    },
    title: {
      control: 'text',
      description: 'Tooltip title',
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========== BASIC EXAMPLES ==========

export const Default: Story = {
  args: {
    name: 'search',
    size: 24,
  },
};

export const WithCustomSize: Story = {
  args: {
    name: 'heart',
    size: 32,
  },
};

export const WithColor: Story = {
  args: {
    name: 'star',
    size: 24,
    className: 'text-yellow-500',
  },
  parameters: {
    docs: {
      description: {
        story: 'Icons inherit color from parent or can be styled with Tailwind classes.',
      },
    },
  },
};

export const WithTitle: Story = {
  args: {
    name: 'info',
    size: 24,
    title: 'Information',
  },
  parameters: {
    docs: {
      description: {
        story: 'Add a title for tooltip on hover (automatically includes aria-label).',
      },
    },
  },
};

// ========== SIZE VARIATIONS ==========

export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <Icon name="search" size={16} />
        <p className="text-xs mt-1">16px</p>
      </div>
      <div className="text-center">
        <Icon name="search" size={20} />
        <p className="text-xs mt-1">20px</p>
      </div>
      <div className="text-center">
        <Icon name="search" size={24} />
        <p className="text-xs mt-1">24px (default)</p>
      </div>
      <div className="text-center">
        <Icon name="search" size={32} />
        <p className="text-xs mt-1">32px</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Standard size options: 16px (small), 20px (medium), 24px (default), 32px (large).',
      },
    },
  },
};

// ========== COLOR TOKENS ==========

export const ColorTokens: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Icon name="heart" size={32} className="text-coria-primary" />
        <code className="text-sm">text-coria-primary</code>
      </div>
      <div className="flex items-center gap-4">
        <Icon name="leaf" size={32} className="text-green-600" />
        <code className="text-sm">text-green-600</code>
      </div>
      <div className="flex items-center gap-4">
        <Icon name="star" size={32} className="text-yellow-500" />
        <code className="text-sm">text-yellow-500</code>
      </div>
      <div className="flex items-center gap-4">
        <Icon name="alert-triangle" size={32} className="text-red-500" />
        <code className="text-sm">text-red-500</code>
      </div>
      <div className="flex items-center gap-4">
        <Icon name="info" size={32} className="text-blue-500" />
        <code className="text-sm">text-blue-500</code>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icons support all Tailwind color utilities and custom color tokens.',
      },
    },
  },
};

// ========== ACCESSIBILITY EXAMPLES ==========

export const DecorativeIcon: Story = {
  render: () => (
    <button className="flex items-center gap-2 px-4 py-2 bg-coria-primary text-white rounded">
      <Icon name="download" size={20} aria-hidden="true" />
      <span>Download</span>
    </button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Decorative icons should use aria-hidden="true" when text label is present.',
      },
    },
  },
};

export const InteractiveIcon: Story = {
  render: () => (
    <button
      aria-label="Close dialog"
      className="p-2 hover:bg-gray-100 rounded"
    >
      <Icon name="close" size={20} aria-hidden="true" />
    </button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive icons without text need aria-label on the parent element.',
      },
    },
  },
};

export const WithAriaLabel: Story = {
  args: {
    name: 'check',
    size: 24,
    'aria-label': 'Task completed',
  },
  parameters: {
    docs: {
      description: {
        story: 'Standalone icons that convey meaning should have aria-label.',
      },
    },
  },
};

// ========== ICON GALLERY ==========

const iconCategories = {
  'Core Utility': [
    'apple', 'google-play', 'play',
    'check', 'close', 'x', 'refresh', 'shield-check',
    'arrow-up', 'chevron-down',
    'envelope', 'chat', 'question',
    'star',
  ],
  'CORIA Brand': [
    'coria-foundation', 'heart', 'leaf',
    'vegan-analysis', 'ai-assistant', 'smart-pantry', 'community',
    'esg-score', 'carbon-water', 'carbon', 'water', 'sustainability', 'green-energy', 'cycle',
    'token-economy', 'transparency', 'impact-focus',
  ],
  'Social Media': [
    'twitter', 'linkedin', 'instagram', 'youtube', 'facebook',
  ],
  'Navigation': [
    'home', 'menu', 'search', 'user', 'settings', 'filter',
    'arrow-down', 'arrow-left', 'arrow-right',
    'chevron-left', 'chevron-right',
  ],
  'Actions': [
    'bell', 'download', 'upload', 'share', 'plus', 'minus',
    'sort', 'cart', 'external-link', 'globe', 'language', 'wallet',
  ],
  'Status & Data': [
    'alert-triangle', 'bug', 'info',
    'bar-chart', 'trending-up',
    'file-text', 'flask', 'smartphone', 'book-open',
  ],
} as const;

export const IconGallery: Story = {
  render: () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredIcons = searchQuery
      ? searchIcons(searchQuery)
      : selectedCategory === 'all'
      ? getAvailableIcons()
      : (iconCategories[selectedCategory as keyof typeof iconCategories] as IconName[]) || [];

    return (
      <div className="w-full max-w-6xl p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">CORIA Icon Gallery</h2>
          <p className="text-gray-600">
            {getAvailableIcons().length} icons across {Object.keys(iconCategories).length} categories
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Icon
              name="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coria-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-coria-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Icons
          </button>
          {Object.keys(iconCategories).map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-coria-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category} ({(iconCategories[category as keyof typeof iconCategories] as IconName[]).length})
            </button>
          ))}
        </div>

        {/* Icon Grid */}
        {filteredIcons.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {filteredIcons.map((iconName) => (
              <div
                key={iconName}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-coria-primary hover:bg-coria-primary/5 transition-colors group cursor-pointer"
                title={iconName}
              >
                <Icon
                  name={iconName}
                  size={32}
                  className="text-gray-700 group-hover:text-coria-primary transition-colors"
                  aria-label={iconName}
                />
                <span className="text-xs text-gray-600 mt-2 text-center break-words w-full">
                  {iconName}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Icon name="search" size={48} className="mx-auto mb-4 text-gray-400" aria-hidden="true" />
            <p>No icons found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Results Count */}
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-4">
            Found {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Interactive gallery showcasing all 78 CORIA icons with search and category filtering.',
      },
    },
  },
};

// ========== CATEGORY SHOWCASES ==========

export const CoreUtilityIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4 p-4">
      {iconCategories['Core Utility'].map((iconName) => (
        <div key={iconName} className="flex flex-col items-center p-4 border rounded">
          <Icon name={iconName as IconName} size={32} />
          <span className="text-xs mt-2 text-center">{iconName}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Platform, status, navigation, and communication icons for core functionality.',
      },
    },
  },
};

export const CoriaIconBrandIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4 p-4">
      {iconCategories['CORIA Brand'].map((iconName) => (
        <div key={iconName} className="flex flex-col items-center p-4 border rounded">
          <Icon name={iconName as IconName} size={32} className="text-coria-primary" />
          <span className="text-xs mt-2 text-center">{iconName}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'CORIA-specific brand icons for foundation, features, environmental tracking, and values.',
      },
    },
  },
};

export const SocialMediaIcons: Story = {
  render: () => (
    <div className="grid grid-cols-5 gap-4 p-4">
      {iconCategories['Social Media'].map((iconName) => (
        <div key={iconName} className="flex flex-col items-center p-4 border rounded">
          <Icon name={iconName as IconName} size={32} />
          <span className="text-xs mt-2 text-center">{iconName}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Social media platform icons for sharing and community engagement.',
      },
    },
  },
};

export const NavigationIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4 p-4">
      {iconCategories['Navigation'].map((iconName) => (
        <div key={iconName} className="flex flex-col items-center p-4 border rounded">
          <Icon name={iconName as IconName} size={32} />
          <span className="text-xs mt-2 text-center">{iconName}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Primary navigation, arrows, and directional chevrons for UI navigation.',
      },
    },
  },
};

export const ActionIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4 p-4">
      {iconCategories['Actions'].map((iconName) => (
        <div key={iconName} className="flex flex-col items-center p-4 border rounded">
          <Icon name={iconName as IconName} size={32} />
          <span className="text-xs mt-2 text-center">{iconName}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Action icons for notifications, file operations, sharing, and utilities.',
      },
    },
  },
};

export const StatusDataIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4 p-4">
      {iconCategories['Status & Data'].map((iconName) => (
        <div key={iconName} className="flex flex-col items-center p-4 border rounded">
          <Icon name={iconName as IconName} size={32} />
          <span className="text-xs mt-2 text-center">{iconName}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status indicators, data visualization, and content type icons.',
      },
    },
  },
};

// ========== USAGE PATTERNS ==========

export const InButtonWithText: Story = {
  render: () => (
    <div className="space-y-2">
      <button className="flex items-center gap-2 px-4 py-2 bg-coria-primary text-white rounded hover:bg-green-700">
        <Icon name="download" size={20} aria-hidden="true" />
        Download Report
      </button>
      <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
        Upload File
        <Icon name="upload" size={20} aria-hidden="true" />
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icons paired with text labels for clear button actions.',
      },
    },
  },
};

export const IconOnlyButton: Story = {
  render: () => (
    <div className="flex gap-2">
      <button
        aria-label="Search"
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <Icon name="search" size={20} aria-hidden="true" />
      </button>
      <button
        aria-label="Notifications"
        className="p-2 hover:bg-gray-100 rounded-lg relative"
      >
        <Icon name="bell" size={20} aria-hidden="true" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </button>
      <button
        aria-label="Settings"
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <Icon name="settings" size={20} aria-hidden="true" />
      </button>
      <button
        aria-label="Close"
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <Icon name="close" size={20} aria-hidden="true" />
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-only buttons must have aria-label for accessibility.',
      },
    },
  },
};

export const InAlerts: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <Icon name="check" size={20} className="text-green-600 mt-0.5" aria-hidden="true" />
        <div>
          <h4 className="font-medium text-green-900">Success</h4>
          <p className="text-sm text-green-700">Your changes have been saved successfully.</p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <Icon name="alert-triangle" size={20} className="text-red-600 mt-0.5" aria-hidden="true" />
        <div>
          <h4 className="font-medium text-red-900">Error</h4>
          <p className="text-sm text-red-700">There was a problem processing your request.</p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Icon name="info" size={20} className="text-blue-600 mt-0.5" aria-hidden="true" />
        <div>
          <h4 className="font-medium text-blue-900">Information</h4>
          <p className="text-sm text-blue-700">Your trial period expires in 7 days.</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icons enhance alert messages with visual status indicators.',
      },
    },
  },
};

export const InNavigation: Story = {
  render: () => (
    <nav className="border rounded-lg p-2 space-y-1">
      <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
        <Icon name="home" size={20} aria-hidden="true" />
        <span>Home</span>
      </a>
      <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
        <Icon name="user" size={20} aria-hidden="true" />
        <span>Profile</span>
      </a>
      <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
        <Icon name="settings" size={20} aria-hidden="true" />
        <span>Settings</span>
      </a>
      <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
        <Icon name="bell" size={20} aria-hidden="true" />
        <span>Notifications</span>
        <span className="ml-auto text-xs bg-coria-primary text-white px-2 py-1 rounded-full">3</span>
      </a>
    </nav>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icons improve navigation menu scanability and recognition.',
      },
    },
  },
};
