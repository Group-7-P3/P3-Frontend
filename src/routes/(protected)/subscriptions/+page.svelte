<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import { wordsToTitleCase } from '#lib/utils.ts';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();
	const columns = [
		'licenseKey',
		'customerId',
		'userId',
		'type',
		'createdAt',
		'updatedAt',
		'expiresAt',
		'devices',
		'managedBy'
	];

	/*
	 * formattedSubs changes data.subs to uppercase
	 */
	const formattedSubs = $derived(
		data.subscriptions.map((sub) => ({
			...sub,
			type: wordsToTitleCase(sub.type)
		}))
	);

	function handleRowClick(row: (typeof data.subscriptions)[number]) {
		goto(
			resolve('/(protected)/subscriptions/[licenseKey]', { licenseKey: String(row.licenseKey) })
		);
	}
</script>

<svelte:head>
	<title>Subscriptions</title>
</svelte:head>

<DataTable
	data={formattedSubs}
	{columns}
	totalRows={data.total}
	page={data.page}
	pageSize={data.pageSize}
	filter={data.filter}
	sort={data.sort}
	direction={data.direction}
	route="/(protected)/subscriptions"
	onRowClick={handleRowClick}
/>
