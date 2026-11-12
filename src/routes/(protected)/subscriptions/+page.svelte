<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';
	import { wordsToTitleCase } from '#lib/utils.ts';

	let { data }: { data: PageData } = $props();
	const columns = [
		'licenseKey',
		'userId',
		'type',
		'maxDevices',
		'createdAt',
		'updatedAt',
		'expiresAt',
		'autoRenew',
		'managedBy'
	];

	/*
	 * formattedSubs changes data.subs to uppercase
	 */
	const formattedSubs = $derived(
		data.subscriptions.map((sub) => ({
			...sub,
			type: wordsToTitleCase(sub.type),
			autoRenew: sub.autoRenew ? 'True' : 'False'
		}))
	);
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
/>
