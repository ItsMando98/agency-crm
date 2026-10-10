import { describe, expect, it } from 'vitest';

import { buildReportStyles } from 'src/utils/build-report-styles.util';

describe('buildReportStyles', () => {
  it('defines an A4 print page and a print media block', () => {
    const css = buildReportStyles({ accentColor: '#7a3aa7' });

    expect(css).toContain('size:A4');
    expect(css).toContain('@media print');
  });

  it('uses the accent color and a darker shade of it', () => {
    const css = buildReportStyles({ accentColor: '#ff0000' });

    expect(css).toContain('--red:#ff0000');
    expect(css).toContain('--red-d:rgb(199,0,0)');
  });

  it('keeps status colors fixed whatever the accent is', () => {
    const css = buildReportStyles({ accentColor: '#ff0000' });

    expect(css).toContain('--ok:#3ddc97');
    expect(css).toContain('--crit:#ff3347');
  });

  it('loads no external font or file', () => {
    const css = buildReportStyles({ accentColor: '#7a3aa7' });

    expect(css).not.toMatch(/@import|url\(/);
  });
});
