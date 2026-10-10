// Reads prompts, limits and endpoints straight from the app source, so the
// flow document cannot drift from what the code does.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORKSPACE_ROOT = join(APP_ROOT, '..', '..', '..', '..');

const cache = new Map();

export const readSource = (path) => {
  if (!cache.has(path)) {
    cache.set(path, readFileSync(path, 'utf8'));
  }

  return cache.get(path);
};

const appFile = (relative) => readSource(join(APP_ROOT, 'src', relative));
export const workspaceFile = (relative) => readSource(join(WORKSPACE_ROOT, relative));

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const fail = (message) => {
  throw new Error(`Flow document: ${message}`);
};

export const num = (relative, name) => {
  const match = appFile(relative).match(
    new RegExp(`export const ${escapeRegExp(name)}\\s*=\\s*([0-9_.]+);`),
  );

  if (match === null) {
    fail(`number ${name} not found in ${relative}`);
  }

  return Number(match[1].replaceAll('_', ''));
};

export const str = (relative, name) => {
  const match = appFile(relative).match(
    new RegExp(`(?:export\\s+)?const ${escapeRegExp(name)}\\s*=\\s*'([^']*)';`),
  );

  if (match === null) {
    fail(`string ${name} not found in ${relative}`);
  }

  return match[1];
};

// Returns the text of a template literal, or of a concatenated assignment.
export const template = (relative, name, replacements = {}) => {
  const source = appFile(relative);
  const start = source.search(new RegExp(`const ${escapeRegExp(name)}\\s*=\\s*\``));

  if (start === -1) {
    fail(`template ${name} not found in ${relative}`);
  }

  const open = source.indexOf('`', start);
  let close = open + 1;

  while (close < source.length && !(source[close] === '`' && source[close - 1] !== '\\')) {
    close += 1;
  }

  let text = source.slice(open + 1, close);

  for (const [placeholder, value] of Object.entries(replacements)) {
    text = text.replaceAll('${' + placeholder + '}', String(value));
  }

  if (text.includes('${')) {
    fail(`template ${name} still has an unresolved placeholder`);
  }

  return text;
};

export const objectKeys = (relative, name) => {
  const source = appFile(relative);
  const start = source.search(new RegExp(`export const ${escapeRegExp(name)}\\s*=\\s*\\{`));

  if (start === -1) {
    fail(`object ${name} not found in ${relative}`);
  }

  const end = source.indexOf('} as const', start);

  return [...source.slice(start, end).matchAll(/^\s+([A-Z_]+):/gm)].map((match) => match[1]);
};

export const areaWeights = () => {
  const source = appFile('constants/score-weights.const.ts');
  const block = source.slice(source.indexOf('AREA_WEIGHTS'), source.indexOf('};', source.indexOf('AREA_WEIGHTS')));

  return [...block.matchAll(/^\s+([A-Z_]+):\s*(\d+),/gm)].map((match) => [match[1], Number(match[2])]);
};

export const severityPenalties = () => {
  const source = appFile('constants/score-weights.const.ts');
  const block = source.slice(source.indexOf('SEVERITY_PENALTY'), source.indexOf('} as const', source.indexOf('SEVERITY_PENALTY')));

  return [...block.matchAll(/^\s+([A-Z]+):\s*(\d+),/gm)].map((match) => [match[1], Number(match[2])]);
};

export const gradeThresholds = () =>
  [...appFile('constants/score-weights.const.ts').matchAll(/minScore:\s*(\d+),\s*grade:\s*'([A-F])'/g)].map(
    (match) => [match[2], Number(match[1])],
  );

export const engines = () =>
  [...appFile('constants/ai-visibility.const.ts').matchAll(
    /id:\s*'([A-Z]+)',\s*label:\s*'([^']+)',\s*path:\s*'([^']+)',\s*modelName:\s*'([^']+)',\s*needsWebSearchFlag:\s*(true|false)/g,
  )].map((match) => ({
    id: match[1],
    label: match[2],
    path: match[3],
    modelName: match[4],
    needsWebSearch: match[5] === 'true',
  }));

export const tregEndpoints = () => {
  const source = appFile('constants/ai-visibility.const.ts');
  const block = source.slice(source.indexOf('AI_TREG_ENDPOINTS'));

  return Object.fromEntries(
    [...block.slice(0, block.indexOf('} as const')).matchAll(/([A-Z]+):\s*'([^']+)'/g)].map((match) => [match[1], match[2]]),
  );
};

export const retryPattern = () => {
  const match = appFile('constants/ai-visibility.const.ts').match(
    /AI_RETRYABLE_ERROR_PATTERN\s*=\s*\n?\s*\/([^/]+)\/i;/,
  );

  if (match === null) {
    fail('retry pattern not found');
  }

  return match[1].replaceAll('|', ' | ');
};

export const marketRows = () =>
  [...appFile('constants/dataforseo.const.ts').matchAll(
    /([A-Z]{2}):\s*\{\s*locationCode:\s*(\d+),\s*languageCode:\s*'([a-z]+)',\s*countryCode:\s*'([A-Z]+)'/g,
  )].map((match) => ({ key: match[1], location: Number(match[2]), language: match[3], country: match[4] }));

export const dataForSeoPath = (file) => {
  const match = appFile(`dataforseo-client/${file}`).match(/path:\s*'([^']+)'/);

  if (match === null) {
    fail(`path not found in ${file}`);
  }

  return match[1];
};

const CREATOR_ROOT = 'packages/twenty-apps/internal/creator-studio/src';

export const creatorPromptSource = (functionName) => {
  const source = workspaceFile(`${CREATOR_ROOT}/generation/build-prompts.ts`);
  const start = source.indexOf(`export const ${functionName}`);

  if (start === -1) {
    fail(`prompt ${functionName} not found`);
  }

  // A function with a block body returns its template, an arrow expression is the template.
  const returned = source.indexOf('return `', start);
  const nextExport = source.indexOf('export const', start + 10);
  const open =
    returned !== -1 && (nextExport === -1 || returned < nextExport)
      ? returned + 'return '.length
      : source.indexOf('`', start);
  const close = source.indexOf('`', open + 1);

  if (open === -1 || close === -1) {
    fail(`prompt ${functionName} has no template`);
  }

  return source.slice(open + 1, close);
};

export const creatorNum = (relative, name) => {
  const match = workspaceFile(`${CREATOR_ROOT}/${relative}`).match(
    new RegExp(`export const ${escapeRegExp(name)}\\s*=\\s*([0-9_.]+);`),
  );

  if (match === null) {
    fail(`creator number ${name} not found in ${relative}`);
  }

  return Number(match[1].replaceAll('_', ''));
};

export const creatorStr = (relative, name) => {
  const match = workspaceFile(`${CREATOR_ROOT}/${relative}`).match(
    new RegExp(`export const ${escapeRegExp(name)}\\s*=\\s*'([^']*)';`),
  );

  if (match === null) {
    fail(`creator string ${name} not found in ${relative}`);
  }

  return match[1];
};
