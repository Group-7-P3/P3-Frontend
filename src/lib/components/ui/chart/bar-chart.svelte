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

	const {
		class: className,
		data = [
			{ activity: 'Simon Says', started: 80 },
			{ activity: 'Whack a Mole', started: 200 },
			{ activity: 'Sequence', started: 120 },
			{ activity: 'Reflex', started: 190 },
			{ activity: 'Reaction', started: 130 },
			{ activity: 'Neglect Color', started: 140 }
		],
		config = {
			started: { label: 'Started' }
		},
		x = Object.keys(data[0])[0],
		y = Object.keys(data[0])[1],
		series = [
			{
				key: 'amount',
				label: 'Amount',
				color: 'var(--chart-1)'
			}
		]
	}: Props = $props();

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
		{data}
		{x}
		{y}
		{series}
		seriesLayout="group"
		cRange={chartColors}
		props={{
			bars: {
				stroke: 'none',
				rounded: 'edge',
				radius: 4,
				motion: { type: 'tween', duration: 500, easing: cubicInOut }
			},
			highlight: { area: { fill: 'none' } },
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
	</BarChart>
</Chart.Container>
