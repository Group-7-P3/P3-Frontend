<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<ul>
	{#each data.users as user (user.id)}
		<li>{JSON.stringify(user)}</li>
	{/each}
</ul>
