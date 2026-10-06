import { describe, expect, it } from 'vitest';

import { isPrivateHostname } from 'src/utils/is-private-hostname.util';

describe('isPrivateHostname', () => {
  it.each([
    'localhost',
    'app.localhost',
    'printer.local',
    'db.internal',
    'intranet',
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '::1',
    'fd00::1',
    'fe80::1',
    '::ffff:7f00:1',
    '::ffff:127.0.0.1',
  ])('blocks %s', (hostname) => {
    expect(isPrivateHostname(hostname)).toBe(true);
  });

  it.each(['example.com', 'www.example.co.uk', '8.8.8.8', '172.32.0.1', '2606:4700::1111'])(
    'allows %s',
    (hostname) => {
      expect(isPrivateHostname(hostname)).toBe(false);
    },
  );

  it('handles bracketed IPv6 literals as returned by URL', () => {
    expect(isPrivateHostname(new URL('http://[::1]/').hostname)).toBe(true);
  });
});
