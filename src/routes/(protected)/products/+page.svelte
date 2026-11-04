<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	

	let { data }: { data: PageData } = $props();
	const columns = ['serialNumber', 'status', 'createdAt', 'updatedAt'];

	function handleRowClick(row: (typeof data.products)[number]) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`/products/${row.serialNumber}`);
	}
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<DataTable 
	data={data.products} 
	{columns} 
	class="max-w-6xl" 
	onRowClick={handleRowClick}
/>
