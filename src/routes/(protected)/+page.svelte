<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import { resolve } from '$app/paths';
	import AreaChart from '#lib/components/ui/chart/area-chart.svelte';
	import LineChart from '#lib/components/ui/chart/line-chart.svelte';
	import BarChart from '#lib/components/ui/chart/bar-chart.svelte';
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import PopoverRangeCalendar from '#lib/components/ui/popover-range-calendar.svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import type { DateRange } from 'bits-ui';
	import { today, getLocalTimeZone } from '@internationalized/date';

	const start = today(getLocalTimeZone()).subtract({ months: 1, days: -1 });
	const end = today(getLocalTimeZone());
	let dateRange: DateRange | undefined = $state({ start, end });
	let rangeType: 'week' | 'month' | 'year' | 'ytd' = $state('month');

	const chartData = [
		{ month: new Date('2026-01-01'), home: 50, 'home+': 20, pro: 130, 'pro+': 60 },
		{ month: new Date('2026-02-01'), home: 70, 'home+': 30, pro: 140, 'pro+': 80 },
		{ month: new Date('2026-03-01'), home: 90, 'home+': 40, pro: 140, 'pro+': 80 },
		{ month: new Date('2026-04-01'), home: 130, 'home+': 60, pro: 150, 'pro+': 90 },
		{ month: new Date('2026-05-01'), home: 170, 'home+': 70, pro: 170, 'pro+': 90 },
		{ month: new Date('2026-06-01'), home: 190, 'home+': 90, pro: 183, 'pro+': 101 },
		{ month: new Date('2026-07-01'), home: 220, 'home+': 110, pro: 160, 'pro+': 112 },
		{ month: new Date('2026-08-01'), home: 240, 'home+': 120, pro: 150, 'pro+': 124 },
		{ month: new Date('2026-09-01'), home: 250, 'home+': 120, pro: 130, 'pro+': 127 },
		{ month: new Date('2026-10-01'), home: 270, 'home+': 130, pro: 130, 'pro+': 131 },
		{ month: new Date('2026-11-01'), home: 290, 'home+': 140, pro: 140, 'pro+': 125 },
		{ month: new Date('2026-12-01'), home: 300, 'home+': 140, pro: 160, 'pro+': 118 }
	];

	const chartConfig = {
		home: {
			label: 'Home',
			color: '#ffb000'
		},
		'home+': {
			label: 'Home+',
			color: '#fe6100'
		},
		pro: {
			label: 'Pro',
			color: '#dc267f'
		},
		'pro+': {
			label: 'Pro+',
			color: '#785ef0'
		}
	};
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="flex w-full justify-between">
	<div class="flex gap-6">
		<ToggleGroup.Root bind:value={rangeType} type="single" variant="outline">
			<!-- <ToggleGroup.Item
				value="day"
				onclick={() => {
					dateRange = {
						start: today(getLocalTimeZone()).set({ month: 1, day: 1 }),
						end: today(getLocalTimeZone())
					};
				}}
			>
				Day
			</ToggleGroup.Item> -->
			<ToggleGroup.Item
				value="week"
				onclick={() => {
					dateRange = {
						start: today(getLocalTimeZone()).subtract({ weeks: 1 }),
						end: today(getLocalTimeZone())
					};
				}}
			>
				Week
			</ToggleGroup.Item>
			<ToggleGroup.Item
				value="month"
				onclick={() => {
					dateRange = {
						start: today(getLocalTimeZone()).subtract({ months: 1 }),
						end: today(getLocalTimeZone())
					};
				}}
			>
				Month
			</ToggleGroup.Item>
			<ToggleGroup.Item
				value="year"
				onclick={() => {
					dateRange = {
						start: today(getLocalTimeZone()).subtract({ years: 1 }),
						end: today(getLocalTimeZone())
					};
				}}
			>
				Year
			</ToggleGroup.Item>
			<ToggleGroup.Item
				value="ytd"
				onclick={() => {
					dateRange = {
						start: today(getLocalTimeZone()).set({ month: 1, day: 1 }),
						end: today(getLocalTimeZone())
					};
				}}
			>
				YTD
			</ToggleGroup.Item>
		</ToggleGroup.Root>

		<PopoverRangeCalendar bind:value={dateRange} />
	</div>

	<ButtonGroup.Root>
		<Button
			variant="outline"
			size="icon"
			onclick={() => {
				if (!dateRange?.start || !dateRange?.end) return;
				switch (rangeType) {
					case 'week':
						dateRange = {
							start: dateRange.start.subtract({ weeks: 1 }),
							end: dateRange.end.subtract({ weeks: 1 })
						};
						break;
					case 'month':
						dateRange = {
							start: dateRange.start.subtract({ months: 1 }),
							end: dateRange.end.subtract({ months: 1 })
						};
						break;
					case 'year':
					case 'ytd':
						dateRange = {
							start: dateRange.start.subtract({ years: 1 }),
							end: dateRange.end.subtract({ years: 1 })
						};
						break;
				}
			}}
		>
			<ArrowLeft />
		</Button>
		<Button
			variant="outline"
			size="icon"
			onclick={() => {
				if (!dateRange?.start || !dateRange?.end) return;
				switch (rangeType) {
					case 'week':
						dateRange = {
							start: dateRange.start.add({ weeks: 1 }),
							end: dateRange.end.add({ weeks: 1 })
						};
						break;
					case 'month':
						dateRange = {
							start: dateRange.start.add({ months: 1 }),
							end: dateRange.end.add({ months: 1 })
						};
						break;
					case 'year':
					case 'ytd':
						dateRange = {
							start: dateRange.start.add({ years: 1 }),
							end: dateRange.end.add({ years: 1 })
						};
						break;
				}
			}}
		>
			<ArrowRight />
		</Button>
	</ButtonGroup.Root>
</div>

<!-- Statistic cards -->
<div class="flex w-full gap-6">
	<!-- Users card -->
	<a href={resolve('/(protected)/users')} class="flex-1">
		<Card.Root class="w-full gap-5">
			<Card.Header>
				<Card.Title>
					<h3>Users</h3>
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					<div class="flex justify-between">
						<span>Today</span>
						<span>12</span>
					</div>

					<div class="flex justify-between">
						<span>This week</span>
						<span>123</span>
					</div>

					<div class="flex justify-between">
						<span>This month</span>
						<span>1234</span>
					</div>

					<div class="flex justify-between font-semibold">
						<span>Total</span>
						<span>12345678</span>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</a>

	<!-- Subscriptions card -->
	<a href={resolve('/(protected)/subscriptions')} class="flex-1">
		<Card.Root class="w-full gap-5">
			<Card.Header>
				<Card.Title>
					<h3>Subscriptions</h3>
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					<div class="flex justify-between">
						<span>Today</span>
						<span>12</span>
					</div>

					<div class="flex justify-between">
						<span>This week</span>
						<span>123</span>
					</div>

					<div class="flex justify-between">
						<span>This month</span>
						<span>1234</span>
					</div>

					<div class="flex justify-between font-semibold">
						<span>Total</span>
						<span>12345678</span>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</a>

	<!-- Products card -->
	<a href={resolve('/(protected)/products')} class="flex-1">
		<Card.Root class="w-full gap-5">
			<Card.Header>
				<Card.Title>
					<h3>Products</h3>
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					<div class="flex justify-between">
						<span>Today</span>
						<span>12</span>
					</div>

					<div class="flex justify-between">
						<span>This week</span>
						<span>123</span>
					</div>

					<div class="flex justify-between">
						<span>This month</span>
						<span>1234</span>
					</div>

					<div class="flex justify-between font-semibold">
						<span>Total</span>
						<span>12345678</span>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</a>
</div>

<!-- Bar chart -->
<div class="w-full">
	<Card.Root>
		<Card.Header>
			<Card.Title>Activities</Card.Title>
		</Card.Header>

		<Card.Content>
			<BarChart
				class="h-100 px-5"
				config={chartConfig}
				data={chartData}
				series={[
					{
						key: 'home',
						label: 'Home',
						color: chartConfig.home.color
					},
					{
						key: 'home+',
						label: 'Home+',
						color: chartConfig['home+'].color
					},
					{
						key: 'pro',
						label: 'Pro',
						color: chartConfig.pro.color
					},
					{
						key: 'pro+',
						label: 'Pro+',
						color: chartConfig['pro+'].color
					}
				]}
			/>
		</Card.Content>
	</Card.Root>
</div>

<!-- Line chart -->
<div class="w-full">
	<Card.Root>
		<Card.Header>
			<Card.Title>Sales</Card.Title>
		</Card.Header>

		<Card.Content>
			<LineChart
				class="h-100 px-5"
				config={chartConfig}
				data={chartData}
				series={[
					{
						key: 'home',
						label: 'Home',
						color: chartConfig.home.color
					},
					{
						key: 'home+',
						label: 'Home+',
						color: chartConfig['home+'].color
					},
					{
						key: 'pro',
						label: 'Pro',
						color: chartConfig.pro.color
					},
					{
						key: 'pro+',
						label: 'Pro+',
						color: chartConfig['pro+'].color
					}
				]}
			/>
		</Card.Content>
	</Card.Root>
</div>

<!-- Area chart -->
<div class="w-full">
	<Card.Root>
		<Card.Header>
			<Card.Title>Revenue</Card.Title>
		</Card.Header>

		<Card.Content>
			<AreaChart
				class="h-100 px-5"
				data={chartData}
				series={[
					{
						key: 'home',
						label: 'Home',
						color: chartConfig.home.color
					},
					{
						key: 'home+',
						label: 'Home+',
						color: chartConfig['home+'].color
					},
					{
						key: 'pro',
						label: 'Pro',
						color: chartConfig.pro.color
					},
					{
						key: 'pro+',
						label: 'Pro+',
						color: chartConfig['pro+'].color
					}
				]}
			/>
		</Card.Content>
	</Card.Root>
</div>
