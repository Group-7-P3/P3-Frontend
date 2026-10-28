<script>
	import * as Card from '$lib/components/ui/card';
	import * as Chart from '$lib/components/ui/chart';

	import { resolve } from '$app/paths';

	import { curveNatural } from 'd3-shape';
	import { AreaChart, LineChart } from 'layerchart';

	const chartData = [
		{ month: 'January', Home: 50, 'Home+': 20, Pro: 130, 'Pro+': 60 },
		{ month: 'February', Home: 70, 'Home+': 30, Pro: 140, 'Pro+': 80 },
		{ month: 'March', Home: 90, 'Home+': 40, Pro: 140, 'Pro+': 80 },
		{ month: 'April', Home: 130, 'Home+': 60, Pro: 150, 'Pro+': 90 },
		{ month: 'May', Home: 170, 'Home+': 70, Pro: 170, 'Pro+': 90 },
		{ month: 'June', Home: 190, 'Home+': 90, Pro: 183, 'Pro+': 101 },
		{ month: 'July', Home: 220, 'Home+': 110, Pro: 160, 'Pro+': 112 },
		{ month: 'August', Home: 240, 'Home+': 120, Pro: 150, 'Pro+': 124 },
		{ month: 'September', Home: 250, 'Home+': 120, Pro: 130, 'Pro+': 127 },
		{ month: 'October', Home: 270, 'Home+': 130, Pro: 130, 'Pro+': 131 },
		{ month: 'November', Home: 290, 'Home+': 140, Pro: 140, 'Pro+': 125 },
		{ month: 'December', Home: 300, 'Home+': 140, Pro: 160, 'Pro+': 118 }
	];

	const pieData = [
		{ plan: 'Home', value: 100, color: '#ffb000' },
		{ plan: 'Home+', value: 100, color: '#fe6100' },
		{ plan: 'Pro', value: 100, color: '#dc267f' },
		{ plan: 'Pro+', value: 100, color: '#785ef0' }
	];

	const chartConfig = {
		Home: {
			label: 'Home',
			color: '#ffb000'
		},
		'Home+': {
			label: 'Home+',
			color: '#fe6100'
		},
		Pro: {
			label: 'Pro',
			color: '#dc267f'
		},
		'Pro+': {
			label: 'Pro+',
			color: '#785ef0'
		}
	};
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<!-- Statistic cards -->
<div class="flex w-full gap-10 p-10">
	<!-- Users card -->
	<Card.Root class="w-full gap-5">
		<Card.Header>
			<Card.Title>
				<a href={resolve('/(protected)/users')} class="underline"> Users </a>
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

	<!-- Subscriptions card -->
	<Card.Root class="w-full gap-5">
		<Card.Header>
			<Card.Title>
				<a href={resolve('/(protected)/subscriptions')} class="underline"> Subscriptions </a>
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

	<!-- Products card -->
	<Card.Root class="w-full gap-5">
		<Card.Header>
			<Card.Title>
				<a href={resolve('/(protected)/products')} class="underline"> Products </a>
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
			</div></Card.Content
		>
	</Card.Root>
</div>

<!-- Line chart -->
<div class="w-full px-10 pb-10">
	<Card.Root>
		<Card.Header>
			<Card.Title>Sales</Card.Title>
		</Card.Header>

		<Card.Content>
			<Chart.Container config={chartConfig} class="pl-5">
				<LineChart
					data={chartData}
					x="month"
					legend
					axis="both"
					series={[
						{
							key: 'Home',
							label: 'Home',
							color: chartConfig.Home.color
						},
						{
							key: 'Home+',
							label: 'Home+',
							color: chartConfig['Home+'].color
						},
						{
							key: 'Pro',
							label: 'Pro',
							color: chartConfig.Pro.color
						},
						{
							key: 'Pro+',
							label: 'Pro+',
							color: chartConfig['Pro+'].color
						}
					]}
					props={{
						spline: { curve: curveNatural, motion: 'tween', strokeWidth: 2 },
						xAxis: {
							format: (v) => v.slice(0, 3)
						},
						highlight: { points: { r: 4 } }
					}}
				>
					{#snippet tooltip()}
						<Chart.Tooltip hideLabel />
					{/snippet}
				</LineChart>
			</Chart.Container>
		</Card.Content>
	</Card.Root>
</div>

<!-- Area chart -->
<div class="w-full px-10 pb-10">
	<Card.Root>
		<Card.Header>
			<Card.Title>Sales</Card.Title>
		</Card.Header>

		<Card.Content>
			<Chart.Container config={chartConfig} class="pl-5">
				<AreaChart
					data={chartData}
					x="month"
					legend
					axis="both"
					series={[
						{
							key: 'Home',
							label: 'Home',
							color: chartConfig.Home.color
						},
						{
							key: 'Home+',
							label: 'Home+',
							color: chartConfig['Home+'].color
						},
						{
							key: 'Pro',
							label: 'Pro',
							color: chartConfig.Pro.color
						},
						{
							key: 'Pro+',
							label: 'Pro+',
							color: chartConfig['Pro+'].color
						}
					]}
					props={{
						spline: { curve: curveNatural, motion: 'tween', strokeWidth: 2 },
						xAxis: {
							format: (v) => v.slice(0, 3)
						},
						highlight: { points: { r: 4 } }
					}}
				>
					{#snippet tooltip()}
						<Chart.Tooltip hideLabel />
					{/snippet}
				</AreaChart>
			</Chart.Container>
		</Card.Content>
	</Card.Root>
</div>
