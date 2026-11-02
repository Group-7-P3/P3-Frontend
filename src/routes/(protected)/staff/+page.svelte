<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Staff</title>
</svelte:head>

<ul>
	{#each data.staff as staff (staff.id)}
		<li>{JSON.stringify(staff)}</li>
	{/each}
</ul>
