<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { BarChart, type Accessor } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data?: any[];
		config?: Chart.ChartConfig;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		x?: Accessor<any>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		y?: Accessor<any>;
	}

	const {
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
		y = Object.keys(data[0])[1]
	}: Props = $props();

	const chartColors = [
		'var(--chart-1)',
		'var(--chart-2)',
		'var(--chart-3)',
		'var(--chart-4)',
		'var(--chart-5)'
	];
</script>

<Chart.Container {config} class="w-full max-w-7xl">
	<BarChart
		{data}
		{x}
		{y}
		cRange={chartColors}
		props={{
			bars: {
				stroke: 'none',
				rounded: 'top',
				radius: 8,
				motion: { type: 'tween', duration: 500, easing: cubicInOut }
			},
			highlight: { area: { fill: 'none' } }
		}}
	>
		{#snippet tooltip()}
			<Chart.Tooltip />
		{/snippet}
	</BarChart>
</Chart.Container>
