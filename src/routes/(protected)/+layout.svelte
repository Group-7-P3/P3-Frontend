<script lang="ts">
	import '../layout.css';
	import favicon from '#lib/assets/favicon.png';
	import type { LayoutProps } from './$types';
	import Header from '#lib/components/ui/header.svelte';
	import Footer from '#lib/components/ui/footer.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Navigation from '#lib/components/ui/navigation/navigation.svelte';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Sidebar.Provider>
	<Navigation />
	<div class="flex min-h-screen w-full flex-col bg-background">
		<Header sidebar />
		<main class="flex flex-1 flex-col items-center gap-6 p-6">
			<ModeWatcher />
			{@render children()}
		</main>
		<Footer />
	</div>
</Sidebar.Provider>
