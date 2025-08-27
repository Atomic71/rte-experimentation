import type { CSSProperties } from 'react'

// Design tokens - single source of truth for design decisions
export const tokens = {
  // Colors
  colors: {
    // Primary brand colors
    primary: {
      50: '#e8f4fd',
      500: '#007acc',
      600: '#0066b3',
    },
    
    // Semantic colors
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    
    // Neutral colors
    white: '#ffffff',
    gray: {
      50: '#f9f9f9',
      100: '#f0f0f0',
      200: '#e5e5e5',
      300: '#ddd',
      400: '#ccc',
      500: '#999',
      600: '#666',
      700: '#333',
      900: '#000',
    },
    
    // UI element colors
    border: '#e0e0e0',
    shadow: 'rgba(0,0,0,0.15)',
    shadowLight: 'rgba(0,0,0,0.1)',
  },
  
  // Spacing scale (8px base unit)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
  },
  
  // Typography
  typography: {
    fontFamily: {
      system: 'system-ui, -apple-system, sans-serif',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Border radius
  borderRadius: {
    sm: '3px',
    md: '4px',
    lg: '8px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 2px 8px rgba(0,0,0,0.15)',
    lg: '0 2px 10px rgba(0,0,0,0.1)',
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 10001,
    modal: 10000,
  },
} as const

// Utility function to create consistent styles
export const createStyle = (styles: CSSProperties): CSSProperties => styles

// Common layout utilities
export const layouts = {
  flex: createStyle({
    display: 'flex',
  }),
  
  flexBetween: createStyle({
    display: 'flex',
    justifyContent: 'space-between',
  }),
  
  flexCenter: createStyle({
    display: 'flex',
    alignItems: 'center',
  }),
  
  flexColumn: createStyle({
    display: 'flex',
    flexDirection: 'column',
  }),
  
  absoluteCenter: createStyle({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }),
  
  absolutePositioned: createStyle({
    position: 'absolute',
  }),
} as const