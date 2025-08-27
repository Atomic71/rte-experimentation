import { tokens, createStyle } from '../tokens'

export const input = {
  default: createStyle({
    width: '100%',
    padding: tokens.spacing.sm,
    border: `1px solid ${tokens.colors.gray[300]}`,
    borderRadius: tokens.borderRadius.md,
    marginBottom: tokens.spacing.sm,
    fontSize: tokens.typography.fontSize.sm,
    fontFamily: tokens.typography.fontFamily.system,
    outline: 'none',
  }),
  
  error: createStyle({
    borderColor: tokens.colors.danger,
  }),
} as const