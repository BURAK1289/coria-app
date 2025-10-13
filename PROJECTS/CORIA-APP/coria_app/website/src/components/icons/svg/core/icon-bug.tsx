import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
}

/**
 * Bug Icon - Bug reports and debugging
 *
 * Design: Outline style, 24×24 grid, 1.75px stroke
 * Use case: Bug reports, error states, debugging tools
 */
export function BugIcon({
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
      <rect x="8" y="6" width="8" height="14" rx="4" />
      <path d="m8 6-3-3M16 6l3-3M8 16l-3 3M16 16l3 3" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="20" y1="11" x2="16" y2="11" />
      <line x1="8" y1="11" x2="4" y2="11" />
    </svg>
  );
}
