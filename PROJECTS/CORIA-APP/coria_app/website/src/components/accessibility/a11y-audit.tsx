'use client';

import { useEffect, useState } from 'react';

interface A11yIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: HTMLElement;
  rule: string;
}

export function A11yAudit() {
  const [issues, setIssues] = useState<A11yIssue[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const runAudit = () => {
      setIsAuditing(true);
      const foundIssues: A11yIssue[] = [];

      // Check for missing alt attributes on images
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        if (!img.alt && !img.getAttribute('aria-hidden')) {
          foundIssues.push({
            type: 'error',
            message: 'Image missing alt attribute',
            element: img,
            rule: 'WCAG 1.1.1',
          });
        }
      });

      // Check for missing form labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        const hasLabel = 
          input.getAttribute('aria-label') ||
          input.getAttribute('aria-labelledby') ||
          document.querySelector(`label[for="${input.id}"]`);
        
        if (!hasLabel) {
          foundIssues.push({
            type: 'error',
            message: 'Form control missing accessible label',
            element: input as HTMLElement,
            rule: 'WCAG 1.3.1',
          });
        }
      });

      // Check for missing heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      headings.forEach((heading) => {
        const currentLevel = parseInt(heading.tagName.charAt(1));
        if (currentLevel > previousLevel + 1) {
          foundIssues.push({
            type: 'warning',
            message: `Heading level skipped from h${previousLevel} to h${currentLevel}`,
            element: heading as HTMLElement,
            rule: 'WCAG 1.3.1',
          });
        }
        previousLevel = currentLevel;
      });

      // Check for low contrast (simplified check)
      const textElements = document.querySelectorAll('p, span, div, a, button, h1, h2, h3, h4, h5, h6');
      textElements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // This is a simplified check - in a real audit, you'd use a proper contrast calculation
        if (color === 'rgb(128, 128, 128)' && backgroundColor === 'rgb(255, 255, 255)') {
          foundIssues.push({
            type: 'warning',
            message: 'Potential low contrast detected',
            element: element as HTMLElement,
            rule: 'WCAG 1.4.3',
          });
        }
      });

      // Check for missing focus indicators
      const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      focusableElements.forEach((element) => {
        const styles = window.getComputedStyle(element, ':focus');
        if (styles.outline === 'none' && !styles.boxShadow.includes('inset')) {
          foundIssues.push({
            type: 'warning',
            message: 'Element may lack visible focus indicator',
            element: element as HTMLElement,
            rule: 'WCAG 2.4.7',
          });
        }
      });

      // Check for missing skip links
      const skipLinks = document.querySelectorAll('a[href^="#"]');
      const hasSkipToMain = Array.from(skipLinks).some(link => 
        link.textContent?.toLowerCase().includes('skip') ||
        link.textContent?.toLowerCase().includes('main')
      );
      
      if (!hasSkipToMain) {
        foundIssues.push({
          type: 'info',
          message: 'Consider adding skip navigation links',
          rule: 'WCAG 2.4.1',
        });
      }

      setIssues(foundIssues);
      setIsAuditing(false);
    };

    // Run audit after page load
    const timer = setTimeout(runAudit, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (process.env.NODE_ENV !== 'development' || issues.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 max-w-md bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-sm">
          🔍 Accessibility Audit {isAuditing && '(Running...)'}
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          {issues.length} issue{issues.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      <div className="p-4 space-y-3">
        {issues.map((issue, index) => (
          <div
            key={index}
            className={`p-2 rounded text-xs ${
              issue.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : issue.type === 'warning'
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            <div className="font-medium">{issue.message}</div>
            <div className="text-xs opacity-75 mt-1">Rule: {issue.rule}</div>
            {issue.element && (
              <button
                className="text-xs underline mt-1"
                onClick={() => {
                  issue.element?.scrollIntoView({ behavior: 'smooth' });
                  issue.element?.focus();
                }}
              >
                Highlight element
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for programmatic accessibility checks
export function useA11yCheck() {
  const checkColorContrast = (foreground: string, background: string): number => {
    // Simplified contrast calculation
    // In a real implementation, you'd use a proper color contrast library
    const getLuminance = (color: string): number => {
      // This is a placeholder - implement proper luminance calculation
      return 0.5;
    };

    const fgLuminance = getLuminance(foreground);
    const bgLuminance = getLuminance(background);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  };

  const checkFocusManagement = (): boolean => {
    const activeElement = document.activeElement;
    return activeElement !== null && activeElement !== document.body;
  };

  const checkAriaLabels = (element: HTMLElement): boolean => {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.getAttribute('aria-describedby')
    );
  };

  return {
    checkColorContrast,
    checkFocusManagement,
    checkAriaLabels,
  };
}