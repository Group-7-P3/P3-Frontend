<script>
	import { onMount } from 'svelte';
	import logo from '#lib/assets/logo.png';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { resolve } from '$app/paths';

	let title = $state('');

	onMount(() => {
		const splitTitle = document.title.split(' - ');
		title = splitTitle.length > 1 ? splitTitle[1] : splitTitle[0];
	});
</script>

<header class="relative flex items-center justify-between border-b border-b-border py-2 pr-6 pl-2">
	<Sidebar.Trigger />
	<h2 class="absolute top-1/2 left-1/2 -translate-1/2">{title}</h2>
	<a href={resolve('/')}><img alt="INNOVAID" src={logo} class="h-4" /></a>
</header>
