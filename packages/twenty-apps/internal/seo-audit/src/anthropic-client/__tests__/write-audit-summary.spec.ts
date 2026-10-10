import { describe, expect, it } from 'vitest';

import { buildTextMessage, createFakeAnthropicClient } from 'src/__mocks__/create-fake-anthropic-client.mock';
import { writeAuditSummary } from 'src/anthropic-client/write-audit-summary';
import { SUMMARY_MODEL } from 'src/constants/classifier.const';

const facts = {
  website: 'https://beispiel.de',
  score: 74,
  tasks: { total: 10, items: [{ number: 1, title: '29 verlinkte Seiten existieren nicht mehr' }] },
};

const answer = {
  headline: 'Technisch solide, inhaltlich schwach (Score 74).',
  strengths: ['Die Sicherheit ist in Ordnung.'],
  blockers: ['29 verlinkte Seiten sind tot und es gibt 31 Fehler.'],
  thisWeek: ['Tote Links beheben.'],
  thisMonth: [],
  thisQuarter: ['Inhalte der schwächsten Seiten überarbeiten.'],
};

describe('writeAuditSummary', () => {
  it('asks the strong model with the facts and marks numbers that are not backed up', async () => {
    const { client, create } = createFakeAnthropicClient(() => buildTextMessage(answer));

    const summary = await writeAuditSummary({ client, facts, language: 'DE' });

    expect(summary?.model).toBe(SUMMARY_MODEL);
    expect(summary?.headline.unverifiedNumbers).toEqual([]);
    expect(summary?.blockers[0]?.unverifiedNumbers).toEqual(['31']);
    expect(summary?.isFullyVerified).toBe(false);

    const request = create.mock.calls[0]?.[0] as unknown as { model: string; messages: { content: string }[]; system: string };

    expect(request.model).toBe(SUMMARY_MODEL);
    expect(request.messages[0]?.content).toContain('Write the summary in German.');
    expect(request.messages[0]?.content).toContain('"score": 74');
    expect(request.system).toContain('Every number you write must be copied exactly from the facts');
  });

  it('is fully verified when every number comes from the facts', async () => {
    const { client } = createFakeAnthropicClient(() =>
      buildTextMessage({ ...answer, blockers: ['29 verlinkte Seiten sind tot.'] }),
    );

    expect((await writeAuditSummary({ client, facts, language: 'DE' }))?.isFullyVerified).toBe(true);
  });

  it('returns null when the model gives no headline or fails', async () => {
    const empty = createFakeAnthropicClient(() => buildTextMessage({ ...answer, headline: '' }));
    const broken = createFakeAnthropicClient(() => {
      throw new Error('overloaded');
    });
    const errors: string[] = [];

    expect(await writeAuditSummary({ client: empty.client, facts, language: 'DE' })).toBeNull();
    expect(
      await writeAuditSummary({ client: broken.client, facts, language: 'EN', onError: (message) => errors.push(message) }),
    ).toBeNull();
    expect(errors).toEqual(['overloaded']);
  });

  it('keeps at most four items per section and cuts long ones', async () => {
    const { client } = createFakeAnthropicClient(() =>
      buildTextMessage({
        ...answer,
        thisWeek: ['a', 'b', 'c', 'd', 'e', 'f'].map((letter) => letter.repeat(10)),
        strengths: ['x'.repeat(800)],
      }),
    );

    const summary = await writeAuditSummary({ client, facts, language: 'DE' });

    expect(summary?.thisWeek).toHaveLength(4);
    expect(summary?.strengths[0]?.text).toHaveLength(450);
  });
});
