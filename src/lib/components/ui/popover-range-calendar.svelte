<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RangeCalendar } from '#lib/components/ui/range-calendar/index.ts';
	import type { DateRange } from 'bits-ui';

	interface Props {
		value?: DateRange;
	}

	const start = today(getLocalTimeZone()).subtract({ months: 1 });
	const end = today(getLocalTimeZone());
	let { value = $bindable({ start, end }) }: Props = $props();
	let rangeOpen = $state(false);
</script>

<Popover.Root bind:open={rangeOpen}>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" class="w-48 justify-between font-normal">
				{value.start?.toDate(getLocalTimeZone()).toLocaleDateString('en-US', {
					day: '2-digit',
					month: '2-digit',
					year: '2-digit'
				})}-{value.end
					?.toDate(getLocalTimeZone())
					.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' })}
				<ChevronDownIcon />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto overflow-hidden p-0" align="start">
		<RangeCalendar bind:value captionLayout="dropdown" maxValue={today(getLocalTimeZone())} />
	</Popover.Content>
</Popover.Root>
