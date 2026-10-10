import { describe, expect, it } from 'vitest';

import {
  parseConnectionTestResult,
  UNREADABLE_TEST_MESSAGE,
} from 'src/front-components/utils/parse-connection-test-result.util';

describe('parseConnectionTestResult', () => {
  it('keeps a well formed result', () => {
    expect(parseConnectionTestResult({ status: 'OK', message: 'Token accepted.' })).toEqual({
      status: 'OK',
      message: 'Token accepted.',
    });
  });

  it.each([
    ['an unknown status', { status: 'MAYBE', message: 'x' }],
    ['a missing message', { status: 'OK' }],
    ['a string', 'OK'],
    ['null', null],
  ])('turns %s into a failure with a readable message', (_label, value) => {
    expect(parseConnectionTestResult(value)).toEqual({
      status: 'FAILED',
      message: UNREADABLE_TEST_MESSAGE,
    });
  });
});
