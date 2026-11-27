<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import type { DateRange, RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
	import { page } from '$app/state';

	interface Props {
		value?: DateRange;
		years?: RangeCalendarPrimitive.YearSelectProps['years'];
		onValueChange?: (value: DateRange) => void;
	}

	const start = today(getLocalTimeZone()).subtract({ months: 1 });
	const end = today(getLocalTimeZone());
	let { value = $bindable({ start, end }), years, onValueChange }: Props = $props();
	let rangeOpen = $state(false);
</script>

<Popover.Root bind:open={rangeOpen}>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" class="justify-between font-normal">
				{#if value.start && value.end}
					{value.start?.toDate(getLocalTimeZone()).toLocaleDateString(page.data.dateFormat, {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric'
					})} to {value.end?.toDate(getLocalTimeZone()).toLocaleDateString(page.data.dateFormat, {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric'
					})}
				{:else}
					<span class="text-muted-foreground">Not set</span>
				{/if}
				<ChevronDownIcon class="text-muted-foreground" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto overflow-hidden p-0" align="start">
		<RangeCalendar
			bind:value
			captionLayout="dropdown"
			maxValue={today(getLocalTimeZone())}
			weekStartsOn={Number(page.data.firstDay) as 0 | 1}
			{onValueChange}
			{years}
		/>
	</Popover.Content>
</Popover.Root>
