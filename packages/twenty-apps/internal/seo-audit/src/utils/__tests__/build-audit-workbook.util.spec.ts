import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';

import { buildAiVisibility } from 'src/__mocks__/build-ai-visibility.mock';
import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildAuditWorkbook } from 'src/utils/build-audit-workbook.util';

const branding = { brandName: 'Muster Agentur', accentColor: '#7a3aa7' };

const readWorkbook = async (buffer: Buffer): Promise<ExcelJS.Workbook> => {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

  return workbook;
};

const sheetNames = (workbook: ExcelJS.Workbook): string[] =>
  workbook.worksheets.map((sheet) => sheet.name);

describe('buildAuditWorkbook', () => {
  it('writes a valid xlsx with all sheets when market data exists', async () => {
    const workbook = await readWorkbook(await buildAuditWorkbook(buildSeoAuditResult(), branding));

    expect(sheetNames(workbook)).toEqual([
      'Übersicht',
      'Maßnahmen',
      'Seiten',
      'Keywords',
      'Backlinks',
      'Wettbewerber',
      'Prüfliste',
    ]);
    expect(workbook.creator).toBe('Muster Agentur');
  });

  it('leaves out market sheets and the review sheet when there is nothing to show', async () => {
    const workbook = await readWorkbook(
      await buildAuditWorkbook(
        buildSeoAuditResult({
          language: 'EN',
          marketData: null,
          keywords: [],
          brokenBacklinkTargets: [],
          assessments: [],
        }),
        { brandName: null, accentColor: '#2a78d6' },
      ),
    );

    expect(sheetNames(workbook)).toEqual(['Overview', 'Actions', 'Pages']);
    expect(workbook.creator).toBe('SEO Audit');
  });

  it('puts score, grade and area ratings on the overview', async () => {
    const workbook = await readWorkbook(await buildAuditWorkbook(buildSeoAuditResult(), branding));
    const sheet = workbook.getWorksheet('Übersicht');

    expect(sheet?.getCell('B1').value).toBe('www.kanzlei-beispiel.de');
    expect(sheet?.getCell('B2').value).toBe('06.10.2026');
    expect(sheet?.getCell('B3').value).toBe(84);
    expect(sheet?.getCell('B4').value).toBe('B');
    expect(sheet?.getCell('A9').value).toBe('Sicherheit');
    expect(sheet?.getCell('B9').value).toBe(98);
    expect(sheet?.getCell('C9').value).toBe('Stark');
  });

  it('adds a sheet with the AI answers when the check ran', async () => {
    const workbook = await readWorkbook(
      await buildAuditWorkbook(buildSeoAuditResult({ language: 'EN', aiVisibility: buildAiVisibility() }), branding),
    );
    const sheet = workbook.getWorksheet('AI answers');

    expect(sheet?.getRow(1).values).toEqual([undefined, 'Question', 'ChatGPT', 'Perplexity', 'Gemini', 'Named instead']);
    expect(sheet?.getRow(2).values).toEqual([
      undefined,
      'Welcher Anwalt hilft bei einer Kündigung?',
      'cited',
      'absent',
      'n/a',
      'rival.de, other.de',
    ]);
  });

  it('leaves the AI answers sheet out when the check was off or asked nothing', async () => {
    const off = await readWorkbook(await buildAuditWorkbook(buildSeoAuditResult({ language: 'EN' }), branding));
    const empty = await readWorkbook(
      await buildAuditWorkbook(
        buildSeoAuditResult({ language: 'EN', aiVisibility: buildAiVisibility({ rows: [], presenceRate: null }) }),
        branding,
      ),
    );

    expect(off.getWorksheet('AI answers')).toBeUndefined();
    expect(empty.getWorksheet('AI answers')).toBeUndefined();
  });

  it('adds the mobile Lighthouse values below the area ratings', async () => {
    const result = buildSeoAuditResult({
      language: 'EN',
      marketData: {
        rankings: null,
        backlinks: null,
        backlinkTargets: [],
        lighthouse: {
          url: 'https://www.kanzlei-beispiel.de/',
          performanceScore: 65,
          largestContentfulPaintMs: 7138,
          cumulativeLayoutShift: 0.123,
          totalBlockingTimeMs: 182,
          fetchedAt: null,
        },
        competitors: [],
        costUsd: 0.005,
        notes: [],
      },
    });
    const sheet = (await readWorkbook(await buildAuditWorkbook(result, branding))).getWorksheet('Overview');
    const valueByLabel = new Map<string, unknown>();

    sheet?.eachRow((row) => valueByLabel.set(String(row.getCell(1).value), row.getCell(2).value));

    expect(valueByLabel.get('Mobile performance score')).toBe(65);
    expect(valueByLabel.get('Mobile LCP (ms)')).toBe(7138);
    expect(valueByLabel.get('Mobile CLS')).toBe(0.123);
    expect(valueByLabel.get('Mobile TBT (ms)')).toBe(182);
  });

  it('leaves the Lighthouse rows out without a measurement', async () => {
    const sheet = (await readWorkbook(await buildAuditWorkbook(buildSeoAuditResult({ language: 'EN' }), branding))).getWorksheet('Overview');
    const labels: string[] = [];

    sheet?.eachRow((row) => labels.push(String(row.getCell(1).value)));

    expect(labels).not.toContain('Mobile LCP (ms)');
  });

  it('turns the action list into a checklist with a status dropdown', async () => {
    const result = buildSeoAuditResult();
    const workbook = await readWorkbook(await buildAuditWorkbook(result, branding));
    const sheet = workbook.getWorksheet('Maßnahmen');

    expect(sheet?.rowCount).toBe(result.tasks.length + 1);
    expect(sheet?.getRow(1).values).toEqual([
      undefined, 'Nr.', 'Priorität', 'Aufwand', 'Bereich', 'Quelle', 'Maßnahme', 'Empfehlung', 'Betroffene URLs', 'URLs', 'Status',
    ]);
    expect(sheet?.getCell('A2').value).toBe(1);
    expect(sheet?.getCell('J2').value).toBe('Offen');
    expect(sheet?.getCell('J2').dataValidation).toMatchObject({
      type: 'list',
      formulae: ['"Offen,In Arbeit,Erledigt,Wird nicht umgesetzt"'],
    });
    expect(sheet?.views[0]).toMatchObject({ state: 'frozen', ySplit: 1 });
    expect(sheet?.autoFilter).toBeDefined();
  });

  it('lists every crawled page with its assessment', async () => {
    const workbook = await readWorkbook(await buildAuditWorkbook(buildSeoAuditResult(), branding));
    const sheet = workbook.getWorksheet('Seiten');
    const assessed = sheet?.getRow(3);

    expect(sheet?.rowCount).toBe(3);
    expect(assessed?.getCell(1).value).toBe('https://kanzlei-beispiel.de/kuendigung');
    expect(assessed?.getCell(9).value).toBe('SERVICE');
    expect(assessed?.getCell(11).value).toBe(2);
    expect(assessed?.getCell(15).value).toBe('Nein');
  });

  it('lists keywords by search volume including the discarded ones', async () => {
    const workbook = await readWorkbook(await buildAuditWorkbook(buildSeoAuditResult(), branding));
    const sheet = workbook.getWorksheet('Keywords');

    expect(sheet?.getCell('A2').value).toBe('wm 2026 spielplan');
    expect(sheet?.getCell('E2').value).toBe('NOT_RELEVANT');
    expect(sheet?.rowCount).toBe(5);
  });

  it('writes backlink metrics, broken targets, competitors and the review list', async () => {
    const workbook = await readWorkbook(await buildAuditWorkbook(buildSeoAuditResult(), branding));
    const backlinks = workbook.getWorksheet('Backlinks');
    const competitors = workbook.getWorksheet('Wettbewerber');
    const review = workbook.getWorksheet('Prüfliste');

    expect(backlinks?.getCell('A2').value).toBe('Backlinks');
    expect(backlinks?.getCell('B2').value).toBe(12840);
    expect(backlinks?.getCell('A7').value).toBe('https://kanzlei-beispiel.de/alte-seite');
    expect(backlinks?.getCell('B7').value).toBe(31);
    expect(competitors?.getCell('A2').value).toBe('anwalt-konkurrent.de');
    expect(competitors?.getCell('C2').value).toBe(480000);
    expect(review?.getCell('A2').value).toBe('Seite');
    expect(review?.getCell('B3').value).toBe('unklarer begriff');
  });

  it('builds English sheet names and status values', async () => {
    const workbook = await readWorkbook(await buildAuditWorkbook(buildSeoAuditResult({ language: 'EN' }), branding));

    expect(sheetNames(workbook)[1]).toBe('Actions');
    expect(workbook.getWorksheet('Actions')?.getCell('J2').value).toBe('Open');
  });

  it('keeps text cells that start with formula characters as plain text', async () => {
    const result = buildSeoAuditResult({
      tasks: [
        {
          ruleId: 'TITLE_MISSING',
          name: '=HYPERLINK("http://evil.test","click")',
          description: 'Fix',
          priority: 'HIGH',
          effort: 'LOW',
          area: 'ON_PAGE',
          source: 'RULE',
          affectedUrls: [],
        },
      ],
    });
    const sheet = (await readWorkbook(await buildAuditWorkbook(result, branding))).getWorksheet('Maßnahmen');

    expect(typeof sheet?.getCell('F2').value).toBe('string');
    expect(sheet?.getCell('F2').formula).toBeUndefined();
  });
});
