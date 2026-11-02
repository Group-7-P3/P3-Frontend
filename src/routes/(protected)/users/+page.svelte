<script lang="ts">
	import { columns } from '#lib/components/ui/data-table/columns.ts';
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<!-- <ul>
	{#each data.users as user (user.id)}
		<li>{JSON.stringify(user)}</li>
	{/each}
</ul> -->

<DataTable data={data.users} {columns} class="max-w-6xl" />
