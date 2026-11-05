<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const columns = ['id', 'customerId', 'createdAt', 'updatedAt', 'managedBy'];
	$effect(() => console.log(columns));
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<DataTable data={data.users} {columns} class="max-w-6xl" />
