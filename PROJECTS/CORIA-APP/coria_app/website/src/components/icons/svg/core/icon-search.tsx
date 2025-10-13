import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
}

/**
 * Search Icon - Search functionality
 *
 * Design: Outline style, 24×24 grid, 1.75px stroke
 * Use case: Search inputs, search buttons, find functionality
 */
export function SearchIcon({
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
