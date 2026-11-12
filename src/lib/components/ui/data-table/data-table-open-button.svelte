<script lang="ts" generics="TData extends RowData">
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ExternalLink } from '@lucide/svelte';
	import type { Row, RowData } from '@tanstack/svelte-table';

	interface Props extends ComponentProps<typeof Button> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		row: Row<any, TData>;
		onClick: ((row: TData) => void) | undefined;
	}

	let { row, onClick, ...restProps }: Props = $props();
</script>

<Button
	variant="outline"
	size="icon-xs"
	{...restProps}
	onclick={() => {
		if (!onClick) return;
		onClick(row.original);
	}}
>
	<ExternalLink />
</Button>
