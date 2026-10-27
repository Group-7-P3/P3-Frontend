<script lang="ts">
	import '../layout.css';
	import favicon from '#lib/assets/favicon.png';
	import type { LayoutProps } from './$types';
	import Header from '#lib/components/ui/header.svelte';
	import Footer from '#lib/components/ui/footer.svelte';
	import { ModeWatcher } from 'mode-watcher';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen w-full flex-col bg-background">
	<Header />
	<main class="flex flex-1 flex-col items-center justify-center">
		<ModeWatcher />
		{@render children()}
	</main>
	<Footer />
</div>
