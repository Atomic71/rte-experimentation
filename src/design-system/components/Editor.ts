import { tokens, createStyle, layouts } from '../tokens';

export const editor = {
  container: createStyle({
    fontFamily: tokens.typography.fontFamily.system,
  }),

  content: createStyle({
    minHeight: '300px',
    padding: tokens.spacing.lg,
    fontSize: tokens.typography.fontSize.md,
    lineHeight: tokens.typography.lineHeight.normal,
    outline: 'none',
  }),

  placeholder: createStyle({
    position: 'absolute',
    top: tokens.spacing.lg,
    left: tokens.spacing.lg,
    color: tokens.colors.gray[500],
    fontSize: tokens.typography.fontSize.md,
    pointerEvents: 'none',
  }),

  wrapper: createStyle({
    position: 'relative',
    border: `1px solid ${tokens.colors.gray[200]}`,
    borderTop: 'none',
  }),
} as const;

export const toolbar = {
  container: createStyle({
    ...layouts.flexCenter,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.md,
    borderBottom: `1px solid ${tokens.colors.gray[200]}`,
    backgroundColor: tokens.colors.gray[50],
  }),

  divider: createStyle({
    width: '1px',
    height: '24px',
    backgroundColor: tokens.colors.gray[300],
    margin: `0 ${tokens.spacing.xs}`,
  }),

  group: createStyle({
    ...layouts.flexCenter,
    gap: tokens.spacing.xs,
  }),
} as const;

export const mention = {
  element: createStyle({
    background: tokens.colors.primary[50],
    color: tokens.colors.primary[500],
    padding: '2px 4px',
    borderRadius: tokens.borderRadius.sm,
    cursor: 'pointer',
    userSelect: 'none',
  }),

  // For HTML serialization
  inlineStyle: `background: ${tokens.colors.primary[50]}; color: ${tokens.colors.primary[500]}; padding: 2px 4px; border-radius: ${tokens.borderRadius.sm}; cursor: pointer;`,
} as const;
