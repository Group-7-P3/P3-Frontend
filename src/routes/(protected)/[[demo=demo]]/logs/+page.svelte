<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';
	import { snakeToTitleCase } from '#lib/utils.ts';
	import { logTypes, severities } from '#lib/types.ts';

	let { data }: { data: PageData } = $props();
	const columns = ['id', 'by', 'group', 'severity', 'type', 'createdAt'];

	const formattedLogs = $derived(
		data.logs.map((log) => ({
			...log,
			severity: snakeToTitleCase(log.severity),
			type: snakeToTitleCase(log.type)
		}))
	);
</script>

<svelte:head>
	<title>Logs</title>
</svelte:head>

<DataTable
	data={formattedLogs}
	{columns}
	totalRows={data.total}
	page={data.page}
	pageSize={data.pageSize}
	filter={data.filter}
	sort={data.sort}
	direction={data.direction}
	route="/(protected)/[[demo=demo]]/logs"
	title="Logs"
	filters={[
		{
			key: 'group',
			label: 'Group',
			type: 'select',
			options: data.groups.map((g) => ({ value: g.name, label: g.name }))
		},
		{
			key: 'severity',
			label: 'Severity',
			type: 'select',
			options: severities.map((s) => ({ value: s, label: snakeToTitleCase(s) }))
		},
		{
			key: 'type',
			label: 'Type',
			type: 'select',
			options: logTypes.map((l) => ({ value: l, label: snakeToTitleCase(l) }))
		},
		{ key: 'createdAt', label: 'Created At', type: 'date-range' }
	]}
/>
