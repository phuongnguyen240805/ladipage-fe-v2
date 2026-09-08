/**
 * Shared SaaS UI tokens.
 *
 * Keep these values presentation-only. Product logic, data fetching and route
 * behavior must never depend on them.
 */
export const uiDensity = {
  compactControl: 32,
  control: 40,
  touchTarget: 44,
  tableRow: 48,
} as const;

export const uiRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const uiSpacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;
