<script lang="ts">
	import '../../layout.css';
	import favicon from '#lib/assets/favicon.png';
	import type { LayoutProps } from './$types';
	import Header from '#lib/components/ui/header.svelte';
	import Footer from '#lib/components/ui/footer.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import Navigation from '#lib/components/ui/navigation/navigation.svelte';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Toaster />
<ModeWatcher />
<Sidebar.Provider>
	<Tooltip.Provider>
		<Navigation />
		<Sidebar.Inset class="flex min-h-screen w-full min-w-0 flex-col bg-background">
			<Header sidebar />
			<main class="relative flex min-h-0 w-full min-w-0 flex-1 flex-col items-center gap-6 p-6">
				{@render children()}
			</main>
			<Footer />
		</Sidebar.Inset>
	</Tooltip.Provider>
</Sidebar.Provider>
