/** Fast, quiet and precise motion for management/workspace UI. */
export const uiMotion = {
  press: 80,
  hover: 120,
  popover: 150,
  standard: 160,
  sidebar: 200,
  panel: 220,
  modal: 220,
} as const;

export const uiEasing = {
  enter: "cubic-bezier(0.16, 1, 0.3, 1)",
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
} as const;
