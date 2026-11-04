<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();
	const columns = ['id', 'customerId', 'managedBy', 'createdAt', 'updatedAt'];

	type UserRecord = (typeof data.users)[number];

	async function handleRowClick(user: UserRecord) {
		await goto(resolve('/(protected)/users/[id]', { id: String(user.id) }));
		/**
		 * This very small function is just a link when clicking a row in the user table.
		 */
	}
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<div class="max-w-6xl space-y-6">
	<DataTable data={data.users} {columns} class="max-w-6xl" onRowClick={handleRowClick} />
</div>
