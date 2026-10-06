import { escapeHtml } from 'src/utils/escape-html.util';

// Task descriptions are a recommendation, optionally followed by a bullet list
// of concrete examples separated by a blank line.
export const renderTaskDescriptionHtml = (description: string): string => {
  const [recommendation, ...rest] = description.split('\n\n');
  const bullets = rest
    .join('\n\n')
    .split('\n')
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2));

  return [
    `<p>${escapeHtml(recommendation)}</p>`,
    bullets.length > 0
      ? `<ul>${bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`
      : '',
  ].join('');
};
