import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
}

/**
 * Bar Chart Icon - Data visualization and analytics
 *
 * Design: Outline style, 24×24 grid, 1.75px stroke
 * Use case: Analytics dashboards, data visualization, statistics
 */
export function BarChartIcon({
  size = 24,
  title,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      {...props}
    >
      {title && <title>{title}</title>}
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
