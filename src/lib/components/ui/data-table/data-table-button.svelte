<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
	import { Button } from '$lib/components/ui/button/index.js';

	interface Props extends ComponentProps<typeof Button> {
		label: string;
	}

	let { label, variant = 'ghost', ...restProps }: Props = $props();
</script>

<Button {variant} {...restProps} class="-mx-3">
	{label}
	<ArrowUpDownIcon class="ms-2 size-4" />
</Button>
