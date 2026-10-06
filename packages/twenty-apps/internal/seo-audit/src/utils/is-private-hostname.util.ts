const toIpv4Octets = (host: string): number[] | null => {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);

  if (match === null) {
    return null;
  }

  const octets = match.slice(1).map(Number);

  return octets.every((octet) => octet <= 255) ? octets : null;
};

const isPrivateIpv4 = ([first, second]: number[]): boolean =>
  first === 0 ||
  first === 10 ||
  first === 127 ||
  first >= 224 ||
  (first === 100 && second >= 64 && second <= 127) ||
  (first === 169 && second === 254) ||
  (first === 172 && second >= 16 && second <= 31) ||
  (first === 192 && second === 168) ||
  (first === 192 && second === 0) ||
  (first === 198 && (second === 18 || second === 19));

const extractMappedIpv4 = (host: string): number[] | null => {
  const mapped = /^::ffff:(.+)$/.exec(host);

  if (mapped === null) {
    return null;
  }

  const dotted = toIpv4Octets(mapped[1]);

  if (dotted !== null) {
    return dotted;
  }

  const groups = /^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(mapped[1]);

  if (groups === null) {
    return null;
  }

  const high = parseInt(groups[1], 16);
  const low = parseInt(groups[2], 16);

  return [high >> 8, high & 255, low >> 8, low & 255];
};

export const isPrivateHostname = (hostname: string): boolean => {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.lan')
  ) {
    return true;
  }

  const ipv4 = toIpv4Octets(host);

  if (ipv4 !== null) {
    return isPrivateIpv4(ipv4);
  }

  if (host.includes(':')) {
    const mappedIpv4 = extractMappedIpv4(host);

    if (mappedIpv4 !== null) {
      return isPrivateIpv4(mappedIpv4);
    }

    return (
      host === '::' ||
      host === '::1' ||
      host.startsWith('fc') ||
      host.startsWith('fd') ||
      host.startsWith('fe8') ||
      host.startsWith('fe9') ||
      host.startsWith('fea') ||
      host.startsWith('feb')
    );
  }

  return !host.includes('.');
};
