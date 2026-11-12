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

	const { class: className, data, config = {}, x, y, series }: Props = $props();

	const chartColors = [
		'var(--chart-1)',
		'var(--chart-2)',
		'var(--chart-3)',
		'var(--chart-4)',
		'var(--chart-5)'
	];
</script>

<Chart.Container {config} class={cn('w-full max-w-7xl', className)}>
	<BarChart
		{x}
		{y}
		{data}
		{series}
		cRange={chartColors}
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
