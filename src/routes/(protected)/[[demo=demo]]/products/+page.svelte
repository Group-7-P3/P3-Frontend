<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import { snakeToTitleCase } from '#lib/utils.ts';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();
	const columns = ['serialNumber', 'type', 'status', 'createdAt', 'updatedAt', 'managedBy'];

	type ProductRow = Omit<(typeof data.products)[number], 'status' | 'type'> & {
		status: string;
		type: string | null;
	};

	/*
	 * formattedProducts changes data.products to uppercase
	 */
	const formattedProducts: ProductRow[] = $derived(
		data.products.map((p) => ({
			...p,
			status: snakeToTitleCase(p.status),
			type: p.type ? snakeToTitleCase(p.type) : null
		}))
	);

	function handleRowClick(row: ProductRow) {
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
			key: 'type',
			label: 'Type',
			type: 'select',
			options: data.productTypes.map((pt) => ({ value: pt.type, label: snakeToTitleCase(pt.type) }))
		},
		{
			key: 'managedBy',
			label: 'Managed By',
			type: 'select',
			options: data.groups.map((g) => ({ value: g.name, label: g.name }))
		}
	]}
/>
