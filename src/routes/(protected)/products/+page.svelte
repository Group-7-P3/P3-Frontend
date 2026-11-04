<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import { wordsToTitleCase } from '#lib/utils.ts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const columns = ['serialNumber', 'status', 'createdAt', 'updatedAt'];

	/*
	 * formattedProducts changes data.products to uppercase
	 */
	const formattedProducts = $derived(
		data.products.map((pro) => ({
			...pro,
			status: wordsToTitleCase(pro.status)
		}))
	);
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<DataTable data={formattedProducts} {columns} class="max-w-6xl" />
