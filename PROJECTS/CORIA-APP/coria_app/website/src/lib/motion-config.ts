/**
 * Global Motion Configuration
 *
 * Provides accessibility support for users with motion sensitivity
 * by respecting the OS-level prefers-reduced-motion setting.
 */

export const motionConfig = {
  /**
   * Respect user's OS-level reduced motion preference
   * - 'user': Automatically disables animations when prefers-reduced-motion is set
   * - 'never': Always show animations (not recommended)
   * - 'always': Never show animations
   */
  reducedMotion: 'user' as const,
};

/**
 * Animation duration constants
 * Standardized across the application for consistency
 */
export const animationDuration = {
  /** Fast micro-interactions (buttons, focus states) */
  micro: 0.2,
  /** Standard transitions (cards, modals) */
  transition: 0.3,
  /** Page-level animations */
  animation: 0.5,
  /** Slow background effects */
  slow: 0.6,
} as const;

/**
 * Easing curves for consistent motion feel
 */
export const easingCurves = {
  /** Standard ease for most animations */
  standard: [0.16, 1, 0.3, 1] as const,
  /** Smooth in-out for emphasis */
  smooth: [0.4, 0, 0.2, 1] as const,
  /** Bounce for playful interactions */
  bounce: [0.68, -0.6, 0.32, 1.6] as const,
} as const;
