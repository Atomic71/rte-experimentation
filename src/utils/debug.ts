/**
 * Debug utilities that are tree-shaken in production builds.
 * Uses import.meta.env.DEV for compile-time checks.
 */

/**
 * Whether we're in debug mode.
 * In production builds, this evaluates to false and the compiler removes debug code.
 */
export const __DEV__ = import.meta.env.DEV;

/**
 * Execute a function only in development mode.
 * Tree-shaken in production builds.
 */
export function runInDev(fn: () => void): void {
  if (__DEV__) {
    fn();
  }
}

/**
 * Check if debug mode is enabled via URL parameter.
 * Only checked in development builds.
 */
export function isDebugEnabled(): boolean {
  if (!__DEV__) return false;
  return new URLSearchParams(window.location.search).get('debug') === 'true';
}
