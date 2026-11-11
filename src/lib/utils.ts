export { cn } from 'cn';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function stringToHex(str: string): string {
	const len = str.length;
	const rgb: [number, number, number] = [0, 0, 0];
	for (let i = 0; i < len; i++) {
		const b = i % 3;
		let c = ((str.charCodeAt(i) & 0x1f) / 31) * 255;
		c = rgb[b] + c;
		if (c > 255) c -= 255;
		rgb[b] = c;
	}

	return '#' + rgb.map((val) => Math.round(val).toString(16).padStart(2, '0')).join('');
}

export function wordsToTitleCase<T extends string | string[] | null>(input: T): T {
	if (input == null) {
		return (Array.isArray(input) ? [] : '') as T;
	}
	const transform = (str: string) =>
		str
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			.replace(/[-_]+/g, '')
			.replace(/\b\w/g, (c) => c.toUpperCase());

	/*
	 * Export function that uses a generic T as string and string[] inputs
	 * It takes all strings and splits words apart and makes them uppercase
	 * It also takes words like customerid and makes them 'Customer Id'
	 */
	return (Array.isArray(input) ? input.map(transform) : transform(input)) as T;
}

export function camelToTitleCase(str: string) {
	const result = str.replace(/([A-Z])/g, ' $1').replace(/^./, (match) => match.toUpperCase());

	return result
		.replace(/\bId\b/g, 'ID')
		.replace(/\bApi\b/g, 'API')
		.replace(/\bUrl\b/g, 'URL');
}

export function isString(value: unknown): value is string {
	return typeof value === 'string';
}

export function trim(value: string) {
	return value.trim();
}

export function isNotEmptyStr(value: string) {
	return value !== '';
}

export function stringCheck(value: unknown) {
	if (isString(value)) {
		const check = trim(value);
		if (isNotEmptyStr(check)) return check;
	}
	return null;
}
