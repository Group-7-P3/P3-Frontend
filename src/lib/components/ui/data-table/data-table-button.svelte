<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowUpDown, ArrowUp, ArrowDown } from '@lucide/svelte';

	interface Props extends ComponentProps<typeof Button> {
		label: string;
		sorted?: 'asc' | 'desc' | false;
	}

	let { label, sorted = false, variant = 'ghost', ...restProps }: Props = $props();
</script>

<Button {variant} {...restProps} class="-mx-3">
	{label}
	{#if sorted === 'asc'}
		<ArrowUp class="ms-2 size-4" />
	{:else if sorted === 'desc'}
		<ArrowDown class="ms-2 size-4" />
	{:else}
		<ArrowUpDown class="ms-2 size-4" />
	{/if}
</Button>
