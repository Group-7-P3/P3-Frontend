<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { wordsToTitleCase } from '#lib/utils.ts';

	let { data }: { data: PageData } = $props();
	const columns = ['id', 'createdAt', 'updatedAt', 'subscriptions', 'managedBy'];

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
		await goto(
			resolve('/(protected)/[[demo=demo]]/users/[id]', { demo: 'demo', id: String(user.id) })
		);
	}
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<DataTable
	data={formattedUser}
	{columns}
	totalRows={data.total}
	page={data.page}
	pageSize={data.pageSize}
	filter={data.filter}
	sort={data.sort}
	direction={data.direction}
	route="/(protected)/[[demo=demo]]/users"
	onRowClick={handleRowClick}
	title="Users"
	filters={[
		{ key: 'createdAt', label: 'Created At', type: 'date-range' },
		{ key: 'updatedAt', label: 'Updated At', type: 'date-range' },
		{
			key: 'managedBy',
			label: 'Managed By',
			type: 'select',
			options: data.groups.map((g) => ({ value: g.name, label: g.name }))
		}
	]}
/>
