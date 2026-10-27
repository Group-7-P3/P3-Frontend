<script>
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { toggleMode, mode } from 'mode-watcher'; // Keep this import as-is
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.MenuItem>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props: tooltipProps })}
				<div {...tooltipProps}>
					<Sidebar.MenuButton onclick={toggleMode}>
						<SunIcon
							class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
						/>
						<MoonIcon
							class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
						/>
						<span>
							{#if mode.current === 'light'}
								Light
							{:else}
								Dark
							{/if}
						</span>
					</Sidebar.MenuButton>
				</div>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content side="right" hidden={sidebar.state !== 'collapsed'}>
			<p>
				{#if mode.current === 'light'}
					Light
				{:else}
					Dark
				{/if}
			</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Sidebar.MenuItem>
