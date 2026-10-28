<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { AreaChart, type Accessor } from 'layerchart';
	import { scaleUtc } from 'd3-scale';
	import { curveNatural } from 'd3-shape';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data?: any[];
		config?: Chart.ChartConfig;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		x?: Accessor<any>;
	}

	const {
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
		x = Object.keys(data[0])[0]
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
	<AreaChart
		{data}
		{x}
		axis="x"
		xScale={scaleUtc()}
		series={[
			{
				key: 'amount',
				label: 'Amount',
				color: 'var(--chart-1)'
			}
		]}
		cRange={chartColors}
		props={{
			area: {
				curve: curveNatural,
				fillOpacity: 0.4,
				line: { class: 'stroke-1' },
				motion: 'tween'
			},
			xAxis: {
				format: (v: Date) => v.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
			}
		}}
	>
		{#snippet tooltip()}
			<Chart.Tooltip
				labelFormatter={(v: Date) =>
					v.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: '2-digit' })}
				indicator="line"
			/>
		{/snippet}
	</AreaChart>
</Chart.Container>
