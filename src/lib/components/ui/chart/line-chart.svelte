<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { LineChart, Tooltip, type Accessor, type SeriesData, type SplineProps } from 'layerchart';
	import type { Component } from 'svelte';
	import { cn } from 'cn';
	import { scaleUtc } from 'd3-scale';
	import { curveStepAfter } from 'd3-shape';
	import Separator from '../separator/separator.svelte';

	interface Props {
		class?: string;
		data?: any[];
		config?: Chart.ChartConfig;
		legend?: boolean;
		x?: Accessor<any>;
		y?: Accessor<any>;
		series?: SeriesData<any, Component<SplineProps>>[];
		showTotal?: boolean;
	}

	let {
		class: className,
		data = [{ month: new Date('2026-01-01'), amount: 80 }],
		config = {
			amount: { label: 'Amount', color: 'var(--chart-1)' }
		},
		legend = false,
		x = 'month',
		y,
		series,
		showTotal = false
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
		{y}
		{legend}
		xScale={scaleUtc()}
		series={resolvedSeries}
		props={{
			spline: {
				curve: curveStepAfter,
				fillOpacity: 0.4,
				motion: 'tween'
			},
			xAxis: {
				format: (v: Date) =>
					v instanceof Date
						? v.toLocaleDateString(undefined, {
								day: '2-digit',
								month: 'short',
								year: v.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined
							})
						: v
			}
		}}
	>
		{#snippet tooltip()}
			<Tooltip.Root class="min-w-32 p-0">
				{#snippet children({ data: tooltipData }: { data: any })}
					<!-- Safely extract payload or entries depending on LayerChart's active point structure -->
					{@const payload =
						tooltipData?.payload ||
						(tooltipData
							? Object.entries(tooltipData).filter(([k]) => k !== String(x) && k !== 'month')
							: [])}
					{@const label =
						typeof x === 'function'
							? x(tooltipData)
							: (tooltipData?.[String(x)] ?? tooltipData?.month)}
					{@const total = Array.isArray(payload)
						? payload.reduce(
								(sum: number, item: any) => sum + (Number(item.value ?? item[1]) || 0),
								0
							)
						: 0}

					<div class="grid gap-1 p-2">
						<div class="text-xs font-semibold text-foreground">
							{label instanceof Date
								? label.toLocaleDateString(undefined, {
										day: '2-digit',
										month: 'long',
										year: '2-digit'
									})
								: label}
						</div>
						<div class="grid gap-0">
							{#each Array.isArray(payload) ? payload : [] as item, i (item.key || item[0] || i)}
								{@const key = item.key || item[0]}
								{@const value = item.value ?? item[1]}
								{@const color = item.color || config[key]?.color || 'var(--chart-1)'}
								{@const labelText = config[key]?.label || key}
								<div class="flex items-center justify-between gap-2 text-xs">
									<div class="flex items-center gap-1.5">
										<span class="h-3 w-1 rounded-full" style="background-color: {color}"></span>
										<span class="text-muted-foreground">{labelText}</span>
									</div>
									<span class="font-mono font-medium text-foreground tabular-nums">
										{value}
									</span>
								</div>
							{/each}
						</div>
					</div>
					{#if showTotal}
						<Separator />
						<div class="inline-flex w-full justify-between p-2 text-xs">
							<span>Total</span>
							<span class="font-mono tabular-nums">{total}</span>
						</div>
					{/if}
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</LineChart>
</Chart.Container>
