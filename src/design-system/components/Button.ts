import { tokens, createStyle } from '../tokens'

// Base button styles
const baseButton = createStyle({
  padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
  border: `1px solid ${tokens.colors.gray[300]}`,
  borderRadius: tokens.borderRadius.md,
  cursor: 'pointer',
  fontSize: tokens.typography.fontSize.sm,
  fontWeight: tokens.typography.fontWeight.bold,
  fontFamily: tokens.typography.fontFamily.system,
  transition: 'all 0.15s ease',
  outline: 'none',
})

// Button variants
export const button = {
  // Default button
  default: createStyle({
    ...baseButton,
    backgroundColor: tokens.colors.white,
    color: tokens.colors.gray[700],
    borderColor: tokens.colors.gray[300],
  }),
  
  // Primary button
  primary: createStyle({
    ...baseButton,
    backgroundColor: tokens.colors.primary[500],
    color: tokens.colors.white,
    borderColor: tokens.colors.primary[500],
  }),
  
  // Danger button
  danger: createStyle({
    ...baseButton,
    backgroundColor: tokens.colors.danger,
    color: tokens.colors.white,
    borderColor: tokens.colors.danger,
  }),
  
  // Active state (for toolbar buttons)
  active: createStyle({
    ...baseButton,
    backgroundColor: tokens.colors.primary[500],
    color: tokens.colors.white,
    borderColor: tokens.colors.primary[500],
  }),
  
  // Small variant
  small: createStyle({
    ...baseButton,
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.gray[600],
  }),
  
  // Small active variant  
  smallActive: createStyle({
    ...baseButton,
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    fontSize: tokens.typography.fontSize.xs,
    backgroundColor: tokens.colors.primary[500],
    color: tokens.colors.white,
    borderColor: tokens.colors.primary[500],
  }),
} as const