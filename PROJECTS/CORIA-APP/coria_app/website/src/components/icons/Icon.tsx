import { SVGProps, memo } from 'react';
import { iconMap, IconName } from './icons-map';

/**
 * CORIA Icon Component
 *
 * Centralized icon system with consistent styling, accessibility, and performance.
 *
 * @example
 * // Basic usage
 * <Icon name="search" />
 *
 * @example
 * // With custom size and color
 * <Icon name="heart" size={32} className="text-coria-primary" />
 *
 * @example
 * // With accessibility
 * <Icon name="close" title="Close dialog" aria-label="Close dialog" />
 *
 * @example
 * // Decorative icon
 * <button>
 *   <Icon name="download" aria-hidden="true" />
 *   Download
 * </button>
 */

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'ref'> {
  /** Icon name from the CORIA icon library */
  name: IconName;

  /** Icon size in pixels (default: 24) */
  size?: number | 16 | 20 | 24 | 32;

  /** Color (uses currentColor by default to inherit parent text color) */
  color?: string;

  /** Accessible title for the icon (creates <title> element) */
  title?: string;

  /** Additional CSS classes */
  className?: string;

  /** Hide icon from screen readers (use for decorative icons) */
  'aria-hidden'?: boolean;

  /** Screen reader label (overrides title) */
  'aria-label'?: string;
}

/**
 * Icon component - Centralized access to all CORIA icons
 */
export const Icon = memo<IconProps>(function Icon({
  name,
  size = 24,
  color,
  title,
  className = '',
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  ...props
}) {
  // Get icon component from map
  const IconComponent = iconMap[name];

  // Development warning for missing icons
  if (!IconComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Icon "${name}" not found in icon map. Available icons: ${Object.keys(iconMap).join(', ')}`
      );
    }
    // Return placeholder in development, nothing in production
    return process.env.NODE_ENV === 'development' ? (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className={className}
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ) : null;
  }

  // Render icon component with props
  return (
    <IconComponent
      width={size}
      height={size}
      color={color}
      className={className}
      title={title}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      data-icon={name} // For testing and debugging
      {...props}
    />
  );
});

// Export IconName type for consumers
export type { IconName };
