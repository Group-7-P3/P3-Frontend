<script>
	import ThemeSwitcher from './theme-switcher.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="flex min-h-40 items-end justify-between border-t border-t-border px-6 py-4">
	Copyright {year} © INNOVAID
	<ThemeSwitcher />
</footer>
