<script lang="ts">
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(() => {
		const handleDragStart = (e: DragEvent) => {
			const target = (e.target as HTMLElement)?.closest?.('a, img');
			if (!target) return;
			e.preventDefault();
		};

		window.addEventListener('dragstart', handleDragStart);

		return () => {
			window.removeEventListener('dragstart', handleDragStart);
		};
	});
</script>

{@render children()}
