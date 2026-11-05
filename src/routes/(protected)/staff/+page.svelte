<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const columns = ['id', 'name', 'email', 'createdAt', 'updatedAt', 'role', 'group'];
</script>

<svelte:head>
	<title>Staff</title>
</svelte:head>

<DataTable data={data.staff} {columns} />
