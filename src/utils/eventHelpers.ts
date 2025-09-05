import React from 'react';

/**
 * Prevents default behavior for all interaction events
 * Used to keep keyboard open on mobile devices
 */
export const preventDefaultHandler = (e: React.SyntheticEvent) => {
  e.preventDefault();
};

/**
 * Creates event handlers that prevent default behavior
 * Useful for buttons that shouldn't dismiss the keyboard on mobile
 */
export const createPreventDefaultHandlers = () => ({
  onMouseDown: preventDefaultHandler,
  onPointerDown: preventDefaultHandler,
  onTouchStart: preventDefaultHandler,
});