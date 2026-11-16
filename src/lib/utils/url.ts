import { tick } from 'svelte';
import { goto } from '$app/navigation';

interface UpdateQueryParamsOptions<
	T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement
> {
	// The current URL object
	currentUrl: URL;
	// Key-value pairs of query parameters to update or remove
	updates: Record<string, string | null | undefined>;
	// The base route path (defaults to currentUrl.pathname)
	route?: string;
	// Optional input element to preserve focus and cursor position on
	inputElement?: T | null;
	// Optional custom navigation function (defaults to SvelteKit's goto)
	navigate?: (url: string) => Promise<void>;
}

export async function updateQueryParams({
	currentUrl,
	updates,
	route = currentUrl.pathname,
	inputElement,
	// eslint-disable-next-line svelte/no-navigation-without-resolve
	navigate = (url) => goto(url, { replaceState: true, reset: false })
}: UpdateQueryParamsOptions) {
	const shouldRestoreFocus = 'filter' in updates;
	const selectionStart = inputElement?.selectionStart;
	const selectionEnd = inputElement?.selectionEnd;

	const params = new URLSearchParams(currentUrl.searchParams);

	for (const [key, value] of Object.entries(updates)) {
		if (value) {
			params.set(key, value);
		} else if (key === 'sort') {
			params.set(key, 'none');
		} else {
			params.delete(key);
		}
	}

	const target = `${route}?${params.toString()}`;
	await navigate(target);

	if (!shouldRestoreFocus || !inputElement) return;

	await tick();
	inputElement.focus();

	const start = Math.min(selectionStart ?? inputElement.value.length, inputElement.value.length);
	const end = Math.min(selectionEnd ?? start, inputElement.value.length);
	inputElement.setSelectionRange(start, end);
}
