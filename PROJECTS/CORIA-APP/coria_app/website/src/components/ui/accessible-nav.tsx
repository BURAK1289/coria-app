'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AccessibleNavProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  role?: 'navigation' | 'menu' | 'menubar';
}

export function AccessibleNav({
  children,
  className,
  'aria-label': ariaLabel = 'Main navigation',
  role = 'navigation',
}: AccessibleNavProps) {
  return (
    <nav
      className={cn('relative', className)}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </nav>
  );
}

interface AccessibleNavListProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function AccessibleNavList({
  children,
  className,
  orientation = 'horizontal',
}: AccessibleNavListProps) {
  return (
    <ul
      className={cn('flex', orientation === 'vertical' ? 'flex-col' : 'flex-row', className)}
      role="menubar"
      aria-orientation={orientation}
    >
      {children}
    </ul>
  );
}

interface AccessibleNavItemProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  hasSubmenu?: boolean;
}

export function AccessibleNavItem({
  children,
  className,
  isActive = false,
  hasSubmenu = false,
}: AccessibleNavItemProps) {
  return (
    <li
      className={cn('relative', className)}
      role="none"
    >
      <div
        role="menuitem"
        aria-current={isActive ? 'page' : undefined}
        aria-haspopup={hasSubmenu ? 'menu' : undefined}
        tabIndex={0}
      >
        {children}
      </div>
    </li>
  );
}

interface AccessibleDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  'aria-label'?: string;
}

export function AccessibleDropdown({
  trigger,
  children,
  className,
  triggerClassName,
  contentClassName,
  'aria-label': ariaLabel = 'Submenu',
}: AccessibleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => prev + 1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => prev - 1);
        }
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <button
        ref={triggerRef}
        className={cn('flex items-center', triggerClassName)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onKeyDown={handleKeyDown}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
        <svg
          className={cn('ml-1 h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50',
            contentClassName
          )}
          role="menu"
          aria-label={ariaLabel}
          aria-orientation="vertical"
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50',
        className
      )}
    >
      {children}
    </a>
  );
}

interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function AccessibleHeading({
  level,
  children,
  className,
  id,
}: AccessibleHeadingProps) {
  const headingProps = {
    className: cn('scroll-mt-20', className),
    id,
    tabIndex: -1 as const,
  };
  
  switch (level) {
    case 1:
      return <h1 {...headingProps}>{children}</h1>;
    case 2:
      return <h2 {...headingProps}>{children}</h2>;
    case 3:
      return <h3 {...headingProps}>{children}</h3>;
    case 4:
      return <h4 {...headingProps}>{children}</h4>;
    case 5:
      return <h5 {...headingProps}>{children}</h5>;
    case 6:
      return <h6 {...headingProps}>{children}</h6>;
    default:
      return <h2 {...headingProps}>{children}</h2>;
  }
}