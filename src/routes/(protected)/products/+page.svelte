<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const columns = ['serialNumber', 'status', 'createdAt', 'updatedAt', 'managedBy'];
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<DataTable data={data.products} {columns} />
