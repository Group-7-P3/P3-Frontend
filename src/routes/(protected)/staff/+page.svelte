<script lang="ts">
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import NewStaffFormDialog from './newStaff-form.svelte';

	// Toggle for Dialog box
	let open = $state(false);

	// Staff Table, i think
	let { data }: { data: PageData } = $props();
	const columns = ['id', 'name', 'email', 'createdAt', 'updatedAt', 'role', 'group'];

	/*
	 * formattedStaff changes data.staff to uppercase
	 */
	const formattedStaff = $derived(
		data.staff.map((staff) => ({
			...staff,
			group: wordsToTitleCase(staff.group),
			role: wordsToTitleCase(staff.role)
		}))
	);

	function handleRowClick(row: (typeof data.staff)[number]) {
		goto(resolve('/(protected)/staff/[UUID]', { UUID: String(row.id) }));
	}
</script>

<svelte:head>
	<title>Staff</title>
</svelte:head>

<DataTable
	data={data.staff}
	{columns}
	totalRows={data.total}
	page={data.page}
	pageSize={data.pageSize}
	filter={data.filter}
	sort={data.sort}
	direction={data.direction}
	route="/(protected)/staff"
	onRowClick={(staff) => {
		console.log(staff.id);
	}}
	/* Add new staff member button, conditional to if user has auth to do so, check for auth */
	onAddClick={() => {
		open = !open;
	}}
/>

<NewStaffFormDialog bind:open />
