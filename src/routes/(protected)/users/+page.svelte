<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { wordsToTitleCase } from '#lib/utils.ts';

	let { data }: { data: PageData } = $props();
	const columns = ['id', 'customerId', 'createdAt', 'updatedAt', 'managedBy'];

	/*
	 * formattedStaff changes data.staff to uppercase
	 */
	const formattedUser = $derived(
		data.users.map((user) => ({
			...user,
			managedBy: wordsToTitleCase(user.managedBy)
		}))
	);

	type UserRecord = (typeof data.users)[number];

	/**
	 * This very small function is just a link when clicking a row in the user table.
	 */
	async function handleRowClick(user: UserRecord) {
		await goto(resolve('/(protected)/users/[id]', { id: String(user.id) }));
	}
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<DataTable data={formattedUser} {columns} class="max-w-6xl" onRowClick={handleRowClick} />
