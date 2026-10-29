<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<ul>
	{#each data.products as product (product.serialNumber)}
		<li>{JSON.stringify(product)}</li>
	{/each}
</ul>
