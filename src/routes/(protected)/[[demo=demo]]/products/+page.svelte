<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import { wordsToTitleCase } from '#lib/utils.ts';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();
	const columns = ['serialNumber', 'status', 'createdAt', 'updatedAt', 'managedBy'];

	/*
	 * formattedProducts changes data.products to uppercase
	 */
	const formattedProducts = $derived(
		data.products.map((pro) => ({
			...pro,
			status: wordsToTitleCase(pro.status)
		}))
	);

	function handleRowClick(row: (typeof data.products)[number]) {
		goto(
			resolve('/(protected)/[[demo=demo]]/products/[serialNumber]', {
				demo: data.demo,
				serialNumber: String(row.serialNumber)
			})
		);
	}
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<DataTable
	data={formattedProducts}
	{columns}
	totalRows={data.total}
	page={data.page}
	pageSize={data.pageSize}
	filter={data.filter}
	sort={data.sort}
	direction={data.direction}
	route="/(protected)/[[demo=demo]]/products"
	onRowClick={handleRowClick}
	title="Products"
	filters={[
		{ key: 'createdAt', label: 'Created At', type: 'date-range' },
		{ key: 'updatedAt', label: 'Updated At', type: 'date-range' },
		{
			key: 'status',
			label: 'Status',
			type: 'select',
			options: [
				{ value: 'active', label: 'Active' },
				{ value: 'inactive', label: 'Inactive' },
				{ value: 'archived', label: 'Archived' }
			]
		},
		{
			key: 'managedBy',
			label: 'Managed By',
			type: 'select',
			options: data.groups.map((g) => ({ value: g.name, label: g.name }))
		}
	]}
/>
