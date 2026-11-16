<!-- range-calendar-month-select.svelte -->
<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { cn } from 'cn';

	let {
		class: className,
		value,
		months,
		onMonthChange // Use a direct typed callback function
	}: {
		class?: string;
		value: number;
		months: { value: number; label: string }[];
		onMonthChange: (month: number) => void;
	} = $props();

	let stringValue = $derived(value?.toString());
	let activeLabel = $derived(months.find((m) => m.value === value)?.label ?? 'Month');
</script>

<Select.Root
	type="single"
	value={stringValue}
	onValueChange={(v) => {
		if (v) onMonthChange(Number.parseInt(v));
	}}
>
	<Select.Trigger class={cn(className, 'z-10')} size="sm">
		<Select.Value placeholder="Month">{activeLabel}</Select.Value>
	</Select.Trigger>
	<Select.Content class="min-w-max">
		{#each months as monthItem (monthItem.value)}
			<Select.Item value={monthItem.value.toString()}>
				{monthItem.label}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
