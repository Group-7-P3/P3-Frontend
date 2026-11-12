<script lang="ts">
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';
	import NewStaffFormDialog from './newStaff-form.svelte';

	// Toggle for Dialog box
	let open = $state(false);

	// Staff Table, i think
	let { data }: { data: PageData } = $props();
	const columns = ['id', 'name', 'email', 'createdAt', 'updatedAt', 'role', 'group'];
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
