<script lang="ts">
	import { page } from '$app/state';
	import * as Card from '$lib/components/ui/card';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import { resolve } from '$app/paths';
	import AreaChart from '#lib/components/ui/chart/area-chart.svelte';
	import LineChart from '#lib/components/ui/chart/line-chart.svelte';
	import BarChart from '#lib/components/ui/chart/bar-chart.svelte';
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import PopoverRangeCalendar from '#lib/components/ui/popover-range-calendar.svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import type { DateRange } from 'bits-ui';
	import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date';
	import type { PageData } from './$types';
	import Separator from '#lib/components/ui/separator/separator.svelte';
	import { snakeToTitleCase } from '#lib/utils.ts';
	import { updateQueryParams } from '#lib/utils/url.ts';

	let { data }: { data: PageData } = $props();

	let start = $state(today(getLocalTimeZone()).subtract({ months: 1, days: -1 }));
	let end = $state(today(getLocalTimeZone()));
	let dateRange: DateRange | undefined = $derived({ start, end });
	let rangeType: 'week' | 'month' | 'year' | 'ytd' | 'all-time' = $state('month');

	const years = $derived.by(() => {
		const currentYear = new Date().getFullYear();
		const startYear = 2026;
		const endYear = currentYear;
		return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
	});

	let activityChartType: 'seconds' | 'uses' = $state('seconds');
	const activityChartData = $derived.by(() => {
		// Map existing activities from the server response for quick lookup
		const activityMap = new Map(
			data.activities.map((a) => [
				a.activity.toLowerCase(),
				{ seconds: Number(a.totalSeconds), uses: Number(a.totalUses) }
			])
		);

		// Iterate through the static config keys to guarantee a fixed order and full set of bars
		return Object.keys(activityChartConfig).map((key) => {
			const title = snakeToTitleCase(key);
			const existing = activityMap.get(key) || { seconds: 0, uses: 0 };
			return {
				activity: title,
				seconds: existing.seconds,
				uses: existing.uses
			};
		});
	});
	const activityChartConfig = {
		simon_says: { label: 'Simon Says', color: '#ffb000' },
		neglect_color: { label: 'Neglect Color', color: '#fe6100' },
		sequence: { label: 'Sequence', color: '#dc267f' },
		whack_a_mole: { label: 'Whack A Mole', color: '#785ef0' },
		reaction: { label: 'Reaction', color: '#648fff' },
		reflex: { label: 'Reflex', color: '#4b0082' },
		balance: { label: 'Balance', color: '#0099ff' },
		force: { label: 'Force', color: '#00cc99' }
	};

	const activitySeries = $derived(
		activityChartType === 'seconds'
			? [{ key: 'seconds', label: 'Seconds' }]
			: [{ key: 'uses', label: 'Uses' }]
	);

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

	const isNextDateInFuture = $derived.by(() => {
		if (!end) return true;
		const todayDate = today(getLocalTimeZone());
		switch (rangeType) {
			case 'week':
				return end.add({ weeks: 1 }).compare(todayDate) > 0;
			case 'month':
				return end.add({ months: 1 }).compare(todayDate) > 0;
			case 'year':
				return end.add({ years: 1 }).compare(todayDate) > 0;
			case 'ytd':
			case 'all-time':
			default:
				return true;
		}
	});

	async function setDate(startDate?: CalendarDate, endDate?: CalendarDate) {
		if (startDate) start = startDate;
		if (endDate) end = endDate;

		handleDateChange(start, end);
	}

	async function handleDateChange(newStart: CalendarDate, newEnd: CalendarDate) {
		start = newStart;
		end = newEnd;

		await updateQueryParams({
			currentUrl: new URL(page.url.toString()),
			updates: {
				start: newStart.toString(),
				end: newEnd.toString()
			},
			route: page.url.pathname
		});
	}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<!-- Statistic cards -->
<div class="flex w-full gap-6">
	<!-- Users card -->
	<a href={resolve('/(protected)/users')} class="flex-1">
		<Card.Root class="w-full gap-5 transition-all duration-100 ease-out hover:outline-8">
			<Card.Header>
				<Card.Title>Users</Card.Title>
			</Card.Header>
			<Separator />

			<Card.Content>
				<div class="flex justify-between">
					<span>Day</span>
					<span>12</span>
				</div>

				<div class="flex justify-between">
					<span>Week</span>
					<span>123</span>
				</div>

				<div class="flex justify-between">
					<span>Month</span>
					<span>1234</span>
				</div>

				<div class="flex justify-between">
					<span>Year</span>
					<span>12345</span>
				</div>
			</Card.Content>
			<Separator />
			<Card.Footer>
				<div class="flex w-full justify-between font-semibold">
					<span>Total</span>
					<span>12345678</span>
				</div>
			</Card.Footer>
		</Card.Root>
	</a>

	<!-- Subscriptions card -->
	<a href={resolve('/(protected)/subscriptions')} class="flex-1">
		<Card.Root class="w-full gap-5 transition-all duration-100 ease-out hover:outline-8">
			<Card.Header>
				<Card.Title>Subscriptions</Card.Title>
			</Card.Header>
			<Separator />
			<Card.Content>
				<div class="flex justify-between">
					<span>Day</span>
					<span>12</span>
				</div>

				<div class="flex justify-between">
					<span>Week</span>
					<span>123</span>
				</div>

				<div class="flex justify-between">
					<span>Month</span>
					<span>1234</span>
				</div>

				<div class="flex justify-between">
					<span>Year</span>
					<span>12345</span>
				</div>
			</Card.Content>
			<Separator />
			<Card.Footer>
				<div class="flex w-full justify-between font-semibold">
					<span>Total</span>
					<span>12345678</span>
				</div>
			</Card.Footer>
		</Card.Root>
	</a>

	<!-- Products card -->
	<a href={resolve('/(protected)/products')} class="flex-1">
		<Card.Root class="w-full gap-5 transition-all duration-100 ease-out hover:outline-8">
			<Card.Header>
				<Card.Title>Products</Card.Title>
			</Card.Header>
			<Separator />
			<Card.Content>
				<div class="flex justify-between">
					<span>Day</span>
					<span>12</span>
				</div>

				<div class="flex justify-between">
					<span>Week</span>
					<span>123</span>
				</div>

				<div class="flex justify-between">
					<span>Month</span>
					<span>1234</span>
				</div>

				<div class="flex justify-between">
					<span>Year</span>
					<span>12345</span>
				</div>
			</Card.Content>
			<Separator />
			<Card.Footer>
				<div class="flex w-full justify-between font-semibold">
					<span>Total</span>
					<span>12345678</span>
				</div>
			</Card.Footer>
		</Card.Root>
	</a>
</div>

<div class="flex w-full gap-4">
	<ButtonGroup.Root>
		<Button
			variant={rangeType === 'week' ? 'default' : 'outline'}
			onclick={() => {
				rangeType = 'week';
				setDate(today(getLocalTimeZone()).subtract({ weeks: 1 }), today(getLocalTimeZone()));
			}}
		>
			Week
		</Button>
		<Button
			variant={rangeType === 'month' ? 'default' : 'outline'}
			onclick={() => {
				rangeType = 'month';
				setDate(today(getLocalTimeZone()).subtract({ months: 1 }), today(getLocalTimeZone()));
			}}
		>
			Month
		</Button>
		<Button
			variant={rangeType === 'year' ? 'default' : 'outline'}
			onclick={() => {
				rangeType = 'year';
				setDate(today(getLocalTimeZone()).subtract({ years: 1 }), today(getLocalTimeZone()));
			}}
		>
			Year
		</Button>
		<Button
			variant={rangeType === 'ytd' ? 'default' : 'outline'}
			onclick={() => {
				rangeType = 'ytd';
				setDate(today(getLocalTimeZone()).set({ month: 1, day: 1 }), today(getLocalTimeZone()));
			}}
		>
			YTD
		</Button>
		<Button
			variant={rangeType === 'all-time' ? 'default' : 'outline'}
			onclick={() => {
				rangeType = 'all-time';
				setDate(new CalendarDate(2026, 9, 2), today(getLocalTimeZone()));
			}}
		>
			All Time
		</Button>
	</ButtonGroup.Root>

	<PopoverRangeCalendar bind:value={dateRange} {years} />

	<ButtonGroup.Root>
		<Button
			variant="outline"
			size="icon"
			disabled={rangeType === 'ytd' || rangeType === 'all-time'}
			onclick={() => {
				if (!start || !end) return;
				switch (rangeType) {
					case 'week':
						setDate(start.subtract({ weeks: 1 }), end.subtract({ weeks: 1 }));
						break;
					case 'month':
						setDate(start.subtract({ months: 1 }), end.subtract({ months: 1 }));
						break;
					case 'year':
						setDate(start.subtract({ years: 1 }), end.subtract({ years: 1 }));
						break;
				}
			}}
		>
			<ArrowLeft />
		</Button>
		<Button
			variant="outline"
			size="icon"
			disabled={rangeType === 'ytd' || rangeType === 'all-time' || isNextDateInFuture}
			onclick={() => {
				if (!start || !end) return;
				switch (rangeType) {
					case 'week':
						setDate(start.add({ weeks: 1 }), end.add({ weeks: 1 }));
						break;
					case 'month':
						setDate(start.add({ months: 1 }), end.add({ months: 1 }));
						break;
					case 'year':
						setDate(start.add({ years: 1 }), end.add({ years: 1 }));
						break;
				}
			}}
		>
			<ArrowRight />
		</Button>
	</ButtonGroup.Root>
</div>

<!-- Bar chart -->
<div class="w-full">
	<Card.Root>
		<Card.Header class="flex items-center justify-between">
			<Card.Title>Activities</Card.Title>
			<ButtonGroup.Root>
				<Button
					variant={activityChartType === 'seconds' ? 'default' : 'outline'}
					size="sm"
					onclick={() => {
						activityChartType = 'seconds';
					}}>Seconds</Button
				>
				<Button
					variant={activityChartType === 'uses' ? 'default' : 'outline'}
					size="sm"
					onclick={() => {
						activityChartType = 'uses';
					}}>Uses</Button
				>
			</ButtonGroup.Root>
		</Card.Header>
		<Separator />
		<Card.Content>
			<BarChart
				class="h-100 px-5"
				data={activityChartData}
				config={activityChartConfig}
				series={activitySeries}
				x="activity"
				y={activityChartType === 'seconds' ? 'seconds' : 'uses'}
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
		<Separator />
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
		<Separator />
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
