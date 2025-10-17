'use client';

import { MotionConfig } from 'framer-motion';
import { motionConfig } from '@/lib/motion-config';

interface MotionProviderProps {
  children: React.ReactNode;
}

/**
 * Motion Configuration Provider
 *
 * Wraps the application with Framer Motion configuration
 * to respect user's reduced motion preferences (WCAG 2.1 AA compliance)
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig reducedMotion={motionConfig.reducedMotion}>
      {children}
    </MotionConfig>
  );
}
