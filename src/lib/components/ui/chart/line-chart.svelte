<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { LineChart, type Accessor, type SeriesData, type SplineProps } from 'layerchart';
	import { curveMonotoneX } from 'd3-shape';
	import type { Component } from 'svelte';
	import { cn } from 'cn';
	import { scaleUtc } from 'd3-scale';

	interface Props {
		class?: string;
		data?: any[];
		config?: Chart.ChartConfig;
		x?: Accessor<any>;
		series?: SeriesData<any, Component<SplineProps>>[];
	}

	let {
		class: className,
		data = [{ month: new Date('2026-01-01'), amount: 80 }],
		config = {
			amount: { label: 'Amount', color: 'var(--chart-1)' }
		},
		x = 'month', // Default to 'month' for date-based grouped series
		series
	}: Props = $props();

	// Automatically derive series from config if none are explicitly passed
	const resolvedSeries = $derived(
		series ||
			Object.entries(config).map(([key, item]) => ({
				key,
				label: item.label,
				color: item.color || 'var(--chart-1)'
			}))
	);
</script>

<Chart.Container {config} class={cn('w-full max-w-7xl', className)}>
	<LineChart
		{data}
		{x}
		legend
		xScale={scaleUtc()}
		series={resolvedSeries}
		props={{
			spline: {
				curve: curveMonotoneX,
				fillOpacity: 0.4,
				motion: 'tween'
			},
			xAxis: {
				format: (v: Date) =>
					v instanceof Date ? v.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : v
			}
		}}
	>
		{#snippet tooltip()}
			<Chart.Tooltip
				labelFormatter={(v: Date) =>
					v instanceof Date
						? v.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: '2-digit' })
						: v}
				indicator="line"
			/>
		{/snippet}
	</LineChart>
</Chart.Container>
