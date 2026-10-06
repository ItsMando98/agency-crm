type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function mergeContent<TBase>(base: TBase, overlay: unknown): TBase {
	if (overlay === undefined || overlay === null) return base;

	if (Array.isArray(base)) {
		if (Array.isArray(overlay)) {
			return base.map((item, index) => mergeContent(item, overlay[index])) as TBase;
		}
		if (isPlainObject(overlay)) {
			return base.map(item => {
				const slug = isPlainObject(item) ? item.slug : undefined;
				return typeof slug === 'string' ? mergeContent(item, overlay[slug]) : item;
			}) as TBase;
		}
		return base;
	}

	if (isPlainObject(base)) {
		if (!isPlainObject(overlay)) return base;
		const result: Record<string, unknown> = { ...base };
		for (const key of Object.keys(base)) {
			result[key] = mergeContent(base[key], overlay[key]);
		}
		return result as TBase;
	}

	return (typeof overlay === typeof base ? overlay : base) as TBase;
}

export type { Json };
