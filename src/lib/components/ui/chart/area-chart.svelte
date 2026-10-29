<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { AreaChart, type Accessor, type AreaProps, type SeriesData } from 'layerchart';
	import { curveNatural } from 'd3-shape';
	import type { Component } from 'svelte';
	import { cn } from 'cn';
	import { scaleUtc } from 'd3-scale';

	interface Props {
		class?: string;
		data?: any[];
		config?: Chart.ChartConfig;
		x?: Accessor<any>;
		series?: SeriesData<any, Component<AreaProps>>[];
	}

	const {
		class: className,
		data = [
			{ date: new Date('2026-01-01'), amount: 80 },
			{ date: new Date('2026-01-02'), amount: 200 },
			{ date: new Date('2026-01-03'), amount: 120 },
			{ date: new Date('2026-01-04'), amount: 190 },
			{ date: new Date('2026-01-05'), amount: 130 },
			{ date: new Date('2026-01-06'), amount: 140 }
		],
		config = {
			amount: { label: 'Amount' }
		},
		x = Object.keys(data[0])[0],
		series = [
			{
				key: 'amount',
				label: 'Amount',
				color: 'var(--chart-1)'
			}
		]
	}: Props = $props();
</script>

<Chart.Container {config} class={cn('w-full max-w-7xl', className)}>
	<AreaChart
		{data}
		{x}
		legend
		xScale={scaleUtc()}
		{series}
		props={{
			area: {
				curve: curveNatural,
				fillOpacity: 0.4,
				line: { class: 'stroke-1' },
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
	</AreaChart>
</Chart.Container>
