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
		series?: SeriesData<any, Component<BarsProps>>[];
		x?: Accessor<any>;
		y?: Accessor<any>;
		yLabel?: string;
		palette?: string[];
	}

	const defaultPalette = [
		'var(--chart-1)',
		'var(--chart-2)',
		'var(--chart-3)',
		'var(--chart-4)',
		'var(--chart-5)'
	];

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
		config: configProp,
		series,
		x = Object.keys(data[0])[0],
		y = Object.keys(data[0])[1],
		yLabel,
		palette = defaultPalette
	}: Props = $props();

	function labelOf(d: any): string {
		const v = typeof x === 'function' ? x(d) : typeof x === 'string' ? d[x] : undefined;
		return String(v);
	}

	const yKey = $derived(typeof y === 'string' ? y : 'value');

	// Each bar gets the next color in the palette, wrapping around after the last one
	const cDomain = $derived(data.map(labelOf));
	const cRange = $derived(cDomain.map((_, i) => palette[i % palette.length]));

	const config = $derived<Chart.ChartConfig>(
		configProp ?? { [yKey]: { label: yLabel ?? 'Started' } }
	);
</script>

<Chart.Container {config} class={cn('w-full max-w-7xl', className)}>
	<BarChart
		{data}
		{series}
		{x}
		{y}
		c={x}
		{cDomain}
		{cRange}
		padding={{
			left: yLabel ? 54 : 0,
			bottom: 24,
			top: 0,
			right: 0
		}}
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
					v instanceof Date
						? v.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
						: v
			},
			yAxis: {
				label: yLabel
			}
		}}
	>
		{#snippet tooltip()}
			<Chart.Tooltip
				labelFormatter={(v: Date) =>
					v instanceof Date
						? v.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: '2-digit' })
						: v}
				indicator="line"
			/>
		{/snippet}
	</BarChart>
</Chart.Container>
