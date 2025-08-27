import { tokens, createStyle } from '../tokens'

export const dropdown = {
  container: createStyle({
    backgroundColor: tokens.colors.white,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    boxShadow: tokens.shadows.md,
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: tokens.zIndex.dropdown,
    minWidth: '200px',
  }),
  
  item: createStyle({
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    cursor: 'pointer',
    borderBottom: `1px solid ${tokens.colors.gray[200]}`,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colors.white,
    transition: 'background-color 0.15s ease',
  }),
  
  itemSelected: createStyle({
    backgroundColor: tokens.colors.gray[100],
  }),
  
  itemName: createStyle({
    fontWeight: tokens.typography.fontWeight.bold,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.gray[900],
  }),
  
  itemSubtext: createStyle({
    color: tokens.colors.gray[600],
    fontSize: tokens.typography.fontSize.xs,
    marginTop: '2px',
  }),
} as const