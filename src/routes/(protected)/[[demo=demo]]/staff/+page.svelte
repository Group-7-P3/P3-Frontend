<script lang="ts">
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';
	import NewStaffFormDialog from './newStaff-form.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// Toggle for Dialog box
	let open = $state(false);

	// Staff Table, i think
	let { data }: { data: PageData } = $props();
	const columns = ['id', 'name', 'email', 'createdAt', 'updatedAt', 'role', 'group'];

	function handleRowClick(row: (typeof data.staff)[number]) {
		goto(
			resolve('/(protected)/[[demo=demo]]/staff/[UUID]', { demo: data.demo, UUID: String(row.id) })
		);
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
	route="/(protected)/[[demo=demo]]/staff"
	/*Defines what happens when the button at the start of the row is clicked
	it redirects to a specific staff's subpage*/
	onRowClick={handleRowClick}
	/* Add new staff member button, conditional to if user has auth to do so, check for auth */
	onAddClick={() => {
		open = !open;
	}}
	title="Staff"
	filters={[
		{ key: 'createdAt', label: 'Created At', type: 'date-range' },
		{ key: 'updatedAt', label: 'Updated At', type: 'date-range' },
		{
			key: 'role',
			label: 'Role',
			type: 'select',
			options: [
				{ value: 'supporter', label: 'Supporter' },
				{ value: 'admin', label: 'Admin' },
				{ value: 'owner', label: 'Owner' }
			]
		},
		{
			key: 'group',
			label: 'Group',
			type: 'select',
			options: data.groups.map((g) => ({ value: g.name, label: g.name }))
		}
	]}
/>

<NewStaffFormDialog {data} bind:open />
