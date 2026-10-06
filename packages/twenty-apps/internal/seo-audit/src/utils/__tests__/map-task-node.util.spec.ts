import { describe, expect, it } from 'vitest';

import { mapTaskNode } from 'src/utils/map-task-node.util';

describe('mapTaskNode', () => {
  it('maps a task and splits the affected urls', () => {
    expect(
      mapTaskNode({
        id: 't1',
        ruleId: 'TITLE_MISSING',
        name: 'Add titles',
        description: 'Write a title',
        priority: 'HIGH',
        effort: 'LOW',
        area: 'ON_PAGE',
        source: 'RULE',
        status: 'OPEN',
        affectedUrls: 'https://a.de/\nhttps://a.de/b',
      }),
    ).toEqual({
      id: 't1',
      ruleId: 'TITLE_MISSING',
      name: 'Add titles',
      description: 'Write a title',
      priority: 'HIGH',
      effort: 'LOW',
      area: 'ON_PAGE',
      source: 'RULE',
      status: 'OPEN',
      affectedUrls: ['https://a.de/', 'https://a.de/b'],
    });
  });

  it('falls back to medium for missing priority and effort', () => {
    expect(mapTaskNode({ id: 't1', name: 'x' })).toMatchObject({
      priority: 'MEDIUM',
      effort: 'MEDIUM',
      ruleId: null,
      affectedUrls: [],
    });
  });

  it('skips nodes without an id', () => {
    expect(mapTaskNode({ name: 'x' })).toBeNull();
    expect(mapTaskNode(null)).toBeNull();
  });
});
