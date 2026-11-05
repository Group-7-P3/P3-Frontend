<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import { wordsToTitleCase } from '#lib/utils.ts';
	import type { PageData } from './$types';

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
</script>

<svelte:head>
	<title>Staff</title>
</svelte:head>

<DataTable
	data={formattedStaff}
	{columns}
	onRowClick={(staff) => {
		console.log(staff.id);
	}}
/>
