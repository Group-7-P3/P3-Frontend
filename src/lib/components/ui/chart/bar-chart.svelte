<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { cn } from 'cn';
	import { BarChart, type Accessor, type BarsProps, type SeriesData } from 'layerchart';
	import type { Component } from 'svelte';
	import { cubicInOut } from 'svelte/easing';

	interface Props {
		class?: string;
		data?: any[];
		config?: Chart.ChartConfig;
		x?: Accessor<any>;
		y?: Accessor<any>;
		series?: SeriesData<any, Component<BarsProps>>[];
	}

	const { class: className, data = [], config = {}, x, y, series }: Props = $props();

	// Extract keys for domain and colors for range from the config object
	const domains = $derived(Object.keys(config));
	const colors = $derived(
		Object.values(config)
			.map((item) => item.color)
			.filter((color): color is string => typeof color === 'string')
	);
</script>

<Chart.Container {config} class={cn('w-full max-w-7xl', className)}>
	<BarChart
		{x}
		{y}
		{data}
		{series}
		c={x}
		cDomain={domains.length > 0 ? domains : undefined}
		cRange={colors.length > 0 ? colors : undefined}
		props={{
			bars: {
				stroke: 'none',
				rounded: 'edge',
				radius: 4,
				motion: { type: 'tween', duration: 500, easing: cubicInOut }
			},
			highlight: { area: { fill: 'none' } }
		}}
	/>
</Chart.Container>
