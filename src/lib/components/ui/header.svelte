<script>
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import logo from '#lib/assets/logo.png';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { resolve } from '$app/paths';

	let title = $state('');

	function updateTitle() {
		if (typeof document === 'undefined') return;
		const splitTitle = document.title.split('\n');
		title = splitTitle.length > 1 ? splitTitle[1] : splitTitle[0];
	}

	onMount(updateTitle);
	afterNavigate(updateTitle);
</script>

<header class="relative flex items-center justify-between border-b border-b-border py-2 pr-6 pl-2">
	<Sidebar.Trigger />
	<h2 class="absolute top-1/2 left-1/2 -translate-1/2">{title}</h2>
	<a href={resolve('/')} class="relative">
		<img alt="INNOVAID" src={logo} class="h-4" />

		<!-- To Make the clickable area larger -->
		<span class="absolute -inset-2"></span>
	</a>
</header>
