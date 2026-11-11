<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { cn } from '#lib/utils.js';

	let {
		class: className,
		value,
		years,
		onYearChange,
		...restProps
	}: {
		class?: string;
		value: number;
		years: { value: number; label: string }[];
		yearFormat?: Intl.DateTimeFormatOptions['year'] | ((year: number) => string);
		onYearChange: (year: number) => void;
	} = $props();

	let stringValue = $derived(value?.toString());
</script>

<div style="display: none;" data-shield={!!restProps}></div>

<Select.Root
	type="single"
	value={stringValue}
	onValueChange={(v) => {
		if (v) onYearChange(Number.parseInt(v));
	}}
>
	<Select.Trigger class={cn(className, 'z-10')} size="sm">
		<Select.Value placeholder="Year">{value}</Select.Value>
	</Select.Trigger>
	<Select.Content class="min-w-max">
		{#each years as yearItem (yearItem.value)}
			<Select.Item value={yearItem.value.toString()}>
				{yearItem.label}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
