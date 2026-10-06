import { describe, expect, it } from 'vitest';

import { renderTaskDescriptionHtml } from 'src/utils/render-task-description-html.util';

describe('renderTaskDescriptionHtml', () => {
  it('renders the recommendation as a paragraph', () => {
    expect(renderTaskDescriptionHtml('Fix the links.')).toBe('<p>Fix the links.</p>');
  });

  it('renders details as a bullet list', () => {
    expect(renderTaskDescriptionHtml('Fix it.\n\n- first\n- second')).toBe(
      '<p>Fix it.</p><ul><li>first</li><li>second</li></ul>',
    );
  });

  it('escapes markup in both parts', () => {
    expect(renderTaskDescriptionHtml('<b>x</b>\n\n- <img src=x onerror=alert(1)>')).toBe(
      '<p>&lt;b&gt;x&lt;/b&gt;</p><ul><li>&lt;img src=x onerror=alert(1)&gt;</li></ul>',
    );
  });
});
