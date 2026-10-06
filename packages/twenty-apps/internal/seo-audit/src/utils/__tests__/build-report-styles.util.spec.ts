import { describe, expect, it } from 'vitest';

import { buildReportStyles } from 'src/utils/build-report-styles.util';

describe('buildReportStyles', () => {
  it('defines an A4 print page with footer and page numbers', () => {
    const css = buildReportStyles({ accentColor: '#7a3aa7', footerText: 'Agentur · Audit', pageWord: 'Seite' });

    expect(css).toContain('size: A4');
    expect(css).toContain('content: "Agentur · Audit"');
    expect(css).toContain('content: "Seite " counter(page)');
    expect(css).toContain('--accent: #7a3aa7');
    expect(css).toContain('@media print');
  });

  it('cannot be broken out of by the footer text', () => {
    const css = buildReportStyles({ accentColor: '#2a78d6', footerText: '"; } body { display: none } /*', pageWord: 'Page' });

    expect(css).toContain('content: "\\"; } body { display: none } /*"');
  });

  it('keeps data colors fixed whatever the accent is', () => {
    const css = buildReportStyles({ accentColor: '#ff0000', footerText: 'x', pageWord: 'Page' });

    expect(css).toContain('--bar: #2a78d6');
  });
});
