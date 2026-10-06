import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const localesDir = join(root, 'i18n', 'locales');

const SKIP_KEYS = new Set(['slug', 'number', 'kind', 'type', 'publishedAt', 'date', 'value', 'illustrative', 'readMinutes']);

function isPlainObject(value) {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function textOnly(value, path = '') {
	if (typeof value === 'string') return value;
	if (Array.isArray(value)) {
		const keyed = value.length > 0 && value.every(item => isPlainObject(item) && typeof item.slug === 'string');
		if (keyed) {
			return Object.fromEntries(value.map(item => [item.slug, textOnly(item, path)]));
		}
		return value.map(item => textOnly(item, `${path}[]`));
	}
	if (isPlainObject(value)) {
		const result = {};
		for (const [key, child] of Object.entries(value)) {
			if (SKIP_KEYS.has(key)) continue;
			if (key === 'discipline' && path.endsWith('connects[]')) continue;
			result[key] = textOnly(child, key === 'connects' ? 'connects' : path);
		}
		return result;
	}
	return undefined;
}

async function extract() {
	const [{ disciplines }, { caseStudies }, { articles }] = await Promise.all([
		import(join(root, 'data', 'expertise.ts')),
		import(join(root, 'data', 'case-studies.ts')),
		import(join(root, 'data', 'articles.ts')),
	]);
	const content = {
		expertise: textOnly(disciplines),
		caseStudies: textOnly(caseStudies),
		articles: textOnly(articles),
	};
	writeFileSync(join(localesDir, 'en', 'content.json'), `${JSON.stringify(content, null, '\t')}\n`);
	console.log('wrote en/content.json');
}

function shapeIssues(reference, candidate, path, issues) {
	if (typeof reference === 'string') {
		if (typeof candidate !== 'string' || candidate.trim() === '') issues.push(`${path}: missing or empty`);
		return;
	}
	if (Array.isArray(reference)) {
		if (!Array.isArray(candidate)) return void issues.push(`${path}: expected array`);
		if (candidate.length !== reference.length) issues.push(`${path}: length ${candidate.length} != ${reference.length}`);
		reference.forEach((item, index) => shapeIssues(item, candidate[index], `${path}[${index}]`, issues));
		return;
	}
	if (isPlainObject(reference)) {
		if (!isPlainObject(candidate)) return void issues.push(`${path}: expected object`);
		for (const key of Object.keys(reference)) shapeIssues(reference[key], candidate[key], `${path}.${key}`, issues);
		for (const key of Object.keys(candidate)) if (!(key in reference)) issues.push(`${path}.${key}: unknown key`);
	}
}

function placeholders(text) {
	return [...String(text).matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort().join(',');
}

function check() {
	const read = (locale, file) => {
		const path = join(localesDir, locale, `${file}.json`);
		return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;
	};
	const locales = readdirSync(localesDir).filter(name => name !== 'en');
	const english = { ui: read('en', 'ui'), content: read('en', 'content'), legal: read('en', 'legal') };
	let failed = false;
	const only = process.argv[3];

	for (const locale of locales) {
		if (only && locale !== only) continue;
		const issues = [];
		for (const file of ['ui', 'legal']) {
			const data = read(locale, file);
			if (!data) {
				issues.push(`${file}.json missing`);
				continue;
			}
			for (const key of Object.keys(english[file])) {
				if (typeof data[key] !== 'string' || data[key].trim() === '') issues.push(`${file}:${key} missing`);
				else if (placeholders(data[key]) !== placeholders(english[file][key])) issues.push(`${file}:${key} placeholder mismatch`);
				else if (english[file][key].split('\n').length !== data[key].split('\n').length && file === 'ui') issues.push(`${file}:${key} line count differs`);
			}
			for (const key of Object.keys(data)) if (!(key in english[file])) issues.push(`${file}:${key} unknown key`);
		}
		const content = read(locale, 'content');
		if (!content) issues.push('content.json missing');
		else shapeIssues(english.content, content, 'content', issues);
		if (issues.length > 0) {
			failed = true;
			console.log(`${locale}: ${issues.length} issue(s)`);
			issues.slice(0, 15).forEach(issue => console.log(`  ${issue}`));
		} else {
			console.log(`${locale}: ok`);
		}
	}
	process.exit(failed ? 1 : 0);
}

function format() {
	for (const locale of readdirSync(localesDir)) {
		for (const file of ['ui', 'legal', 'content']) {
			const path = join(localesDir, locale, `${file}.json`);
			if (!existsSync(path)) continue;
			writeFileSync(path, `${JSON.stringify(JSON.parse(readFileSync(path, 'utf8')), null, '\t')}\n`);
		}
	}
	console.log('formatted');
}

const command = process.argv[2];
if (command === 'format') format();
else if (command === 'extract') await extract();
else if (command === 'check') check();
else console.log('usage: node --experimental-strip-types scripts/i18n.mjs <extract|check> [locale]');
