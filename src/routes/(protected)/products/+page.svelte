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
			resolve('/(protected)/products/[serialNumber]', { serialNumber: String(row.serialNumber) })
		);
	}
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<DataTable data={formattedProducts} {columns} class="max-w-6xl" onRowClick={handleRowClick} />
