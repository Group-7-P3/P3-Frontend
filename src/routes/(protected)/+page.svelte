<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { resolve } from '$app/paths';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { getLocalTimeZone, today, type CalendarDate } from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import AreaChart from '#lib/components/ui/chart/area-chart.svelte';
	import LineChart from '#lib/components/ui/chart/line-chart.svelte';
	import BarChart from '#lib/components/ui/chart/bar-chart.svelte';
	const id = $props.id();
	let startOpen = $state(false);
	let startDate = $state<CalendarDate | undefined>();
	let endOpen = $state(false);
	let endDate = $state<CalendarDate | undefined>();

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

<div class="flex w-full gap-6">
	<div class="flex flex-col gap-3">
		<Label for="{id}-date" class="px-1">Start date</Label>
		<Popover.Root bind:open={startOpen}>
			<Popover.Trigger id="{id}-start-date">
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="w-48 justify-between font-normal">
						{startDate ? startDate.toDate(getLocalTimeZone()).toLocaleDateString() : 'Select date'}
						<ChevronDownIcon />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto overflow-hidden p-0" align="start">
				<Calendar
					type="single"
					bind:value={startDate}
					captionLayout="dropdown"
					onValueChange={() => {
						startOpen = false;
					}}
					maxValue={today(getLocalTimeZone())}
				/>
			</Popover.Content>
		</Popover.Root>
	</div>
	<div class="flex flex-col gap-3">
		<Label for="{id}-date" class="px-1">End date</Label>
		<Popover.Root bind:open={endOpen}>
			<Popover.Trigger id="{id}-end-date">
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="w-48 justify-between font-normal">
						{endDate ? endDate.toDate(getLocalTimeZone()).toLocaleDateString() : 'Select date'}
						<ChevronDownIcon />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto overflow-hidden p-0" align="start">
				<Calendar
					type="single"
					bind:value={endDate}
					captionLayout="dropdown"
					onValueChange={() => {
						endOpen = false;
					}}
					maxValue={today(getLocalTimeZone())}
				/>
			</Popover.Content>
		</Popover.Root>
	</div>
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
			<Card.Title>Sales</Card.Title>
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
			<Card.Title>Sales</Card.Title>
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
