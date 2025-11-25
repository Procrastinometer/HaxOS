export const FontStyle = {
  NORMAL: 'normal',
  BOLD: 'bold',
  ITALIC: 'italic',
  SMALL: 'small',
  SMALL_BOLD: 'small-bold',
  SMALL_ITALIC: 'small-italic',
} as const;

export type FontStyle = typeof FontStyle[keyof typeof FontStyle];