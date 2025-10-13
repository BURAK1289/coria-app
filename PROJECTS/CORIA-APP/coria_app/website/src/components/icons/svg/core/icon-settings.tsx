import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
}

/**
 * Settings Icon - Settings and configuration
 *
 * Design: Outline style, 24×24 grid, 1.75px stroke
 * Use case: Settings page, configuration options, preferences
 */
export function SettingsIcon({
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
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v10M1 12h6m6 0h10" />
      <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24M19.07 4.93l-4.24 4.24m-5.66 5.66-4.24 4.24" />
    </svg>
  );
}
