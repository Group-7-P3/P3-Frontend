<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import { wordsToTitleCase } from '#lib/utils.ts';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

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
	data={formattedStaff}
	{columns}
	totalRows={data.total}
	page={data.page}
	pageSize={data.pageSize}
	filter={data.filter}
	sort={data.sort}
	direction={data.direction}
	route="/(protected)/staff"
	onRowClick={handleRowClick}
/>
