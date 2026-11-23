<script lang="ts">
	import { page } from '$app/state';
	import * as Card from '$lib/components/ui/card';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import { resolve } from '$app/paths';
	import LineChart from '#lib/components/ui/chart/line-chart.svelte';
	import AreaChart from '#lib/components/ui/chart/area-chart.svelte';
	import BarChart from '#lib/components/ui/chart/bar-chart.svelte';
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import PopoverRangeCalendar from '#lib/components/ui/popover-range-calendar.svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import type { DateRange } from 'bits-ui';
	import { today, CalendarDate } from '@internationalized/date';
	import type { PageData } from './$types';
	import Separator from '#lib/components/ui/separator/separator.svelte';
	import { snakeToTitleCase } from '#lib/utils.ts';
	import { updateQueryParams } from '#lib/utils/url.ts';

	let { data }: { data: PageData } = $props();

	let todayInZone = $derived(today(data.timeZone));
	let start = $state(today(data.timeZone).set({ month: 1, day: 1 }));
	let end = $state(today(data.timeZone));
	let dateRange: DateRange | undefined = $derived({ start, end });
	let rangeType: 'week' | 'month' | 'year' | 'ytd' | 'all-time' = $state('ytd');

	const years = $derived.by(() => {
		const currentYear = new Date().getFullYear();
		const startYear = 2026;
		const endYear = currentYear;
		return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
	});

	//#region Activity Chart
	let activityChartType: 'seconds' | 'uses' = $state('seconds');
	const activityChartData = $derived.by(() => {
		const activityMap = new Map(
			data.activities.map((a) => [
				a.activity.toLowerCase(),
				{ seconds: Number(a.totalSeconds), uses: Number(a.totalUses) }
			])
		);

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
	//#endregion

	//#region Subscription Chart
	let subscriptionChartType: 'area' | 'line' = $state('area');
	const subscriptionChartConfig = {
		home: { label: 'Home', color: '#ffb000' },
		'home+': { label: 'Home+', color: '#fe6100' },
		pro: { label: 'Pro', color: '#dc267f' },
		'pro+': { label: 'Pro+', color: '#785ef0' }
	};

	const subscriptionChartData = $derived.by(() => {
		const results: Record<string, unknown>[] = [];
		let curr = start;
		const finalEnd = end;

		while (curr.compare(finalEnd) <= 0) {
			const dayStr = curr.toString();
			const dayDate = new Date(`${dayStr}T00:00:00Z`);

			const counts: Record<string, number> = {};
			for (const key of Object.keys(subscriptionChartConfig)) {
				counts[key] = 0;
			}

			for (const sub of data.subscriptions) {
				const createdAtDate = new Date(sub.createdAt);
				const subCreatedStr = createdAtDate.toISOString().split('T')[0];
				const subExpiresStr = String(sub.expiresAt).split('T')[0];

				if (dayStr >= subCreatedStr && dayStr <= subExpiresStr) {
					if (counts[sub.type] !== undefined) {
						counts[sub.type]++;
					}
				}
			}

			results.push({
				month: dayDate,
				...counts
			});

			curr = curr.add({ days: 1 });
		}

		return results;
	});

	const subscriptionSeries = Object.entries(subscriptionChartConfig).map(([key, config]) => ({
		key,
		label: config.label,
		color: config.color
	}));
	//#endregion

	//#region Users Chart
	let userChartType: 'total' | 'new' = $state('total');
	const userChartConfig = {
		total: { label: 'Total Users', color: '#648fff' },
		new: { label: 'New Signups', color: '#00cc99' }
	};

	const userChartData = $derived.by(() => {
		const results: Record<string, unknown>[] = [];
		let curr = start;
		const finalEnd = end;

		while (curr.compare(finalEnd) <= 0) {
			const dayStr = curr.toString();
			const dayDate = new Date(`${dayStr}T00:00:00Z`);

			let totalActive = 0;
			let newSignupsToday = 0;

			for (const user of data.users) {
				const createdAtDate = new Date(user.createdAt);
				const userCreatedStr = createdAtDate.toISOString().split('T')[0];

				// Count total users created on or before this day
				if (userCreatedStr <= dayStr) {
					totalActive++;
				}
				// Count new signups on this exact day
				if (userCreatedStr === dayStr) {
					newSignupsToday++;
				}
			}

			results.push({
				month: dayDate,
				total: totalActive,
				new: newSignupsToday
			});

			curr = curr.add({ days: 1 });
		}

		return results;
	});

	const userSeries = $derived(
		userChartType === 'total'
			? [{ key: 'total', label: userChartConfig.total.label, color: userChartConfig.total.color }]
			: [{ key: 'new', label: userChartConfig.new.label, color: userChartConfig.new.color }]
	);
	//#endregion

	//#region Products Chart
	let productChartType: 'area' | 'line' = $state('area');
	const productChartConfig = {
		pad: { label: 'TreaxPads', color: '#ffb000' },
		pod: { label: 'TreaxPods', color: '#dc267f' }
	};

	const productChartData = $derived.by(() => {
		const results: Record<string, unknown>[] = [];
		let curr = start;
		const finalEnd = end;

		while (curr.compare(finalEnd) <= 0) {
			const dayStr = curr.toString();
			const dayDate = new Date(`${dayStr}T00:00:00Z`);

			const counts: Record<string, number> = {};
			for (const key of Object.keys(productChartConfig)) {
				counts[key] = 0;
			}

			for (const prod of data.products) {
				const createdAtDate = new Date(prod.createdAt);
				const prodCreatedStr = createdAtDate.toISOString().split('T')[0];
				const type: 'pad' | 'pod' = (prod.sn & 1) === 0 ? 'pad' : 'pod';

				if (prodCreatedStr <= dayStr) {
					if (counts[type] !== undefined) {
						counts[type]++;
					}
				}
			}

			results.push({
				month: dayDate,
				...counts
			});

			curr = curr.add({ days: 1 });
		}

		return results;
	});

	const productSeries = Object.entries(productChartConfig).map(([key, config]) => ({
		key,
		label: config.label,
		color: config.color
	}));
	//#endregion

	const isNextDateInFuture = $derived.by(() => {
		if (!end) return true;
		const todayDate = todayInZone;
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
<div class="flex w-full max-w-7xl gap-6">
	<!-- Users card -->
	<a href={resolve('/(protected)/users')} class="flex-1">
		<Card.Root class="w-full gap-5 transition-all duration-100 ease-out hover:outline-8">
			<Card.Header>
				<Card.Title>Users</Card.Title>
			</Card.Header>
			<Separator />
			<Card.Content>
				<div class="flex justify-between"><span>Day</span><span>12</span></div>
				<div class="flex justify-between"><span>Week</span><span>123</span></div>
				<div class="flex justify-between"><span>Month</span><span>1234</span></div>
				<div class="flex justify-between"><span>Year</span><span>12345</span></div>
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
				<div class="flex justify-between"><span>Day</span><span>12</span></div>
				<div class="flex justify-between"><span>Week</span><span>123</span></div>
				<div class="flex justify-between"><span>Month</span><span>1234</span></div>
				<div class="flex justify-between"><span>Year</span><span>12345</span></div>
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
				<div class="flex justify-between"><span>Day</span><span>12</span></div>
				<div class="flex justify-between"><span>Week</span><span>123</span></div>
				<div class="flex justify-between"><span>Month</span><span>1234</span></div>
				<div class="flex justify-between"><span>Year</span><span>12345</span></div>
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

<div class="flex w-full max-w-7xl gap-4">
	<ButtonGroup.Root>
		<Button
			variant={rangeType === 'week' ? 'default' : 'outline'}
			onclick={() => {
				rangeType = 'week';
				setDate(todayInZone.subtract({ weeks: 1 }), todayInZone);
			}}
		>
			Week
		</Button>
		<Button
			variant={rangeType === 'month' ? 'default' : 'outline'}
			onclick={() => {
				rangeType = 'month';
				setDate(todayInZone.subtract({ months: 1 }), todayInZone);
			}}
		>
			Month
		</Button>
		<Button
			variant={rangeType === 'year' ? 'default' : 'outline'}
			onclick={() => {
				rangeType = 'year';
				setDate(todayInZone.subtract({ years: 1 }), todayInZone);
			}}
		>
			Year
		</Button>
		<Button
			variant={rangeType === 'ytd' ? 'default' : 'outline'}
			onclick={() => {
				rangeType = 'ytd';
				setDate(todayInZone.set({ month: 1, day: 1 }), todayInZone);
			}}
		>
			YTD
		</Button>
		<Button
			variant={rangeType === 'all-time' ? 'default' : 'outline'}
			onclick={() => {
				rangeType = 'all-time';
				setDate(new CalendarDate(2026, 9, 2), todayInZone);
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

<!-- Activity chart -->
<div class="w-full max-w-7xl">
	<Card.Root>
		<Card.Header class="flex items-center justify-between">
			<Card.Title>Activities</Card.Title>
			<ButtonGroup.Root>
				<Button
					variant={activityChartType === 'seconds' ? 'default' : 'outline'}
					size="sm"
					onclick={() => {
						activityChartType = 'seconds';
					}}
				>
					Seconds
				</Button>
				<Button
					variant={activityChartType === 'uses' ? 'default' : 'outline'}
					size="sm"
					onclick={() => {
						activityChartType = 'uses';
					}}
				>
					Uses
				</Button>
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

<!-- Subscription chart -->
<div class="w-full max-w-7xl">
	<Card.Root>
		<Card.Header class="flex items-center justify-between">
			<Card.Title>Subscriptions</Card.Title>
			<ButtonGroup.Root>
				<Button
					variant={subscriptionChartType === 'area' ? 'default' : 'outline'}
					size="sm"
					onclick={() => {
						subscriptionChartType = 'area';
					}}
				>
					Area
				</Button>
				<Button
					variant={subscriptionChartType === 'line' ? 'default' : 'outline'}
					size="sm"
					onclick={() => {
						subscriptionChartType = 'line';
					}}
				>
					Line
				</Button>
			</ButtonGroup.Root>
		</Card.Header>
		<Separator />
		<Card.Content>
			{#if subscriptionChartType === 'area'}
				<AreaChart
					class="h-100 px-5"
					config={subscriptionChartConfig}
					data={subscriptionChartData}
					series={subscriptionSeries}
					showTotal
				/>
			{:else}
				<LineChart
					class="h-100 px-5"
					config={subscriptionChartConfig}
					data={subscriptionChartData}
					series={subscriptionSeries}
					showTotal
					legend
				/>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<!-- Users chart -->
<div class="w-full max-w-7xl">
	<Card.Root>
		<Card.Header class="flex items-center justify-between">
			<Card.Title>Users</Card.Title>
			<ButtonGroup.Root>
				<Button
					variant={userChartType === 'total' ? 'default' : 'outline'}
					size="sm"
					onclick={() => {
						userChartType = 'total';
					}}
				>
					Total
				</Button>
				<Button
					variant={userChartType === 'new' ? 'default' : 'outline'}
					size="sm"
					onclick={() => {
						userChartType = 'new';
					}}
				>
					New
				</Button>
			</ButtonGroup.Root>
		</Card.Header>
		<Separator />
		<Card.Content>
			{#if userChartType === 'total'}
				<LineChart
					class="h-100 px-5"
					config={userChartConfig}
					data={userChartData}
					series={userSeries}
					y={userChartType === 'total' ? 'total' : 'new'}
				/>
			{:else}
				<LineChart
					class="h-100 px-5"
					config={userChartConfig}
					data={userChartData}
					series={userSeries}
				/>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<!-- Products chart -->
<div class="w-full max-w-7xl">
	<Card.Root>
		<Card.Header class="flex items-center justify-between">
			<Card.Title>Products</Card.Title>
			<ButtonGroup.Root>
				<Button
					variant={productChartType === 'area' ? 'default' : 'outline'}
					size="sm"
					onclick={() => {
						productChartType = 'area';
					}}
				>
					Area
				</Button>
				<Button
					variant={productChartType === 'line' ? 'default' : 'outline'}
					size="sm"
					onclick={() => {
						productChartType = 'line';
					}}
				>
					Line
				</Button>
			</ButtonGroup.Root>
		</Card.Header>
		<Separator />
		<Card.Content>
			{#if productChartType === 'area'}
				<AreaChart
					class="h-100 px-5"
					config={productChartConfig}
					data={productChartData}
					series={productSeries}
					showTotal
				/>
			{:else}
				<LineChart
					class="h-100 px-5"
					config={productChartConfig}
					data={productChartData}
					series={productSeries}
					showTotal
					legend
				/>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
