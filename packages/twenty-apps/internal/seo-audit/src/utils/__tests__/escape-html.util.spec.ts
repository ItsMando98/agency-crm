import { describe, expect, it } from 'vitest';

import { escapeHtml } from 'src/utils/escape-html.util';

describe('escapeHtml', () => {
  it('escapes markup and quotes', () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;',
    );
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('Kündigungsfrist 2026')).toBe('Kündigungsfrist 2026');
  });
});
