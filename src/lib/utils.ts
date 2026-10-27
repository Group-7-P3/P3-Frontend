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
