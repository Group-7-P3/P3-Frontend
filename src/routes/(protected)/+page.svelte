<script>
	import AreaChart from '#lib/components/ui/chart/area-chart.svelte';
	import BarChart from '#lib/components/ui/chart/bar-chart.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="flex flex-wrap justify-center gap-8">
	<Card.Root class="min-w-xl">
		<Card.Header>
			<Card.Title>Users</Card.Title>
			<Card.Description>01/02/2026 - 01/03/2026</Card.Description>
		</Card.Header>
		<Card.Content>
			<BarChart />
		</Card.Content>
	</Card.Root>

	<Card.Root class="min-w-xl">
		<Card.Header>
			<Card.Title>Subscription</Card.Title>
			<Card.Description>01/02/2026 - 01/03/2026</Card.Description>
		</Card.Header>
		<Card.Content>
			<BarChart
				data={[{ date: '01/02/2026', amount: 2 }]}
				config={{ amount: { label: 'Amount' } }}
			/>
		</Card.Content>
	</Card.Root>

	<Card.Root class="min-w-xl">
		<Card.Header>
			<Card.Title>Products</Card.Title>
			<Card.Description>01/02/2026 - 01/03/2026</Card.Description>
		</Card.Header>
		<Card.Content>
			<AreaChart />
		</Card.Content>
	</Card.Root>

	<Card.Root class="min-w-xl">
		<Card.Header>
			<Card.Title>Activities Started</Card.Title>
			<Card.Description>01/02/2026 - 01/03/2026</Card.Description>
		</Card.Header>
		<Card.Content>
			<AreaChart
				data={[
					{ date: new Date('2026-01-01'), amount: 150 },
					{ date: new Date('2026-02-01'), amount: 80 },
					{ date: new Date('2026-03-01'), amount: 200 },
					{ date: new Date('2026-04-01'), amount: 180 },
					{ date: new Date('2026-05-01'), amount: 120 },
					{ date: new Date('2026-06-01'), amount: 180 }
				]}
			/>
		</Card.Content>
	</Card.Root>
</div>
