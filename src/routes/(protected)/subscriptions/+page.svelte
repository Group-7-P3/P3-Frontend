<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Subscriptions</title>
</svelte:head>

<ul>
	{#each data.subscriptions as subscription (subscription.license_key)}
		<li>{JSON.stringify(subscription)}</li>
	{/each}
</ul>
