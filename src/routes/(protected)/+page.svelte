<script>
	import BarChart from '#lib/components/ui/bar-chart.svelte';
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
			<BarChart />
		</Card.Content>
	</Card.Root>

	<Card.Root class="min-w-xl">
		<Card.Header>
			<Card.Title>Activities Started</Card.Title>
			<Card.Description>01/02/2026 - 01/03/2026</Card.Description>
		</Card.Header>
		<Card.Content>
			<BarChart />
		</Card.Content>
	</Card.Root>
</div>
