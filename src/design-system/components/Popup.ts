import { tokens, createStyle, layouts } from '../tokens'

export const popup = {
  base: createStyle({
    backgroundColor: tokens.colors.white,
    border: `1px solid ${tokens.colors.gray[400]}`,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
    boxShadow: tokens.shadows.lg,
    zIndex: tokens.zIndex.modal,
    minWidth: '300px',
    fontFamily: tokens.typography.fontFamily.system,
  }),
  
  centered: createStyle({
    ...layouts.absoluteCenter,
  }),
  
  positioned: createStyle({
    ...layouts.absolutePositioned,
    transform: 'translateY(-100%)',
  }),
} as const

export const popupContent = {
  title: createStyle({
    marginBottom: tokens.spacing.lg,
    fontWeight: tokens.typography.fontWeight.bold,
    fontSize: tokens.typography.fontSize.md,
    color: tokens.colors.gray[900],
  }),
  
  buttonGroup: createStyle({
    ...layouts.flexBetween,
    marginTop: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  }),
} as const