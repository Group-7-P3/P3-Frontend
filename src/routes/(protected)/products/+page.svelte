<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let columns = $derived(Object.keys(data.products[0]));
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<DataTable data={data.products} {columns} class="max-w-6xl" />
