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
			resolve('/(protected)/[[demo=demo]]/subscriptions/[licenseKey]', {
				demo: data.demo,
				licenseKey: String(row.licenseKey)
			})
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
	route="/(protected)/[[demo=demo]]/subscriptions"
	onRowClick={handleRowClick}
	title="Subscriptions"
	filters={[
		{ key: 'createdAt', label: 'Created At', type: 'date-range' },
		{ key: 'updatedAt', label: 'Updated At', type: 'date-range' },
		{ key: 'expiresAt', label: 'Expires At', type: 'date-range' },
		{
			key: 'type',
			label: 'Type',
			type: 'select',
			options: [
				{ value: 'home', label: 'Home' },
				{ value: 'home+', label: 'Home+' },
				{ value: 'pro', label: 'Pro' },
				{ value: 'pro+', label: 'Pro+' }
			]
		},
		{
			key: 'managedBy',
			label: 'Managed By',
			type: 'select',
			options: [
				{ value: 'innovaid', label: 'INNOVAID' },
				{ value: 'norway', label: 'Norway' },
				{ value: 'italy', label: 'Italy' }
			]
		}
	]}
/>
