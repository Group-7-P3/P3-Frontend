<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let columns = $derived(
		Object.keys(data.staff[0]).filter((col) => !['emailVerified', 'image'].includes(col))
	);
</script>

<svelte:head>
	<title>Staff</title>
</svelte:head>

<DataTable data={data.staff} {columns} class="max-w-6xl" />
