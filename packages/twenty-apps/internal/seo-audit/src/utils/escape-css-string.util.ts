export const escapeCssString = (value: string): string =>
  value.replace(/[\\"]/g, '\\$&').replace(/[\r\n]+/g, ' ').replace(/</g, '\\3C ');
