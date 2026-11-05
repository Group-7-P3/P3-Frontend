<script lang="ts">
	import DataTable from '#lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const columns = [
		'licenseKey',
		'userId',
		'type',
		'maxDevices',
		'createdAt',
		'updatedAt',
		'expiresAt',
		'autoRenew',
		'managedBy'
	];
</script>

<svelte:head>
	<title>Subscriptions</title>
</svelte:head>

<DataTable data={data.subscriptions} {columns} />
