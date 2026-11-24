<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { PageData } from './$types';

	let { data, value = $bindable('') }: { data: PageData; value: string } = $props();

	const groups = $derived(data.groups);
	const groupNames: string[] = $derived(groups.map((group) => group.name));

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				class="w-full justify-between font-normal"
				role="combobox"
				aria-expanded={open}
			>
				{value || 'Select a dristributor group'}
				<ChevronDownIcon class="text-muted-foreground" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-(--bits-popover-anchor-width) p-0">
		<Command.Root>
			<Command.Input placeholder="Search distributors..." />
			<Command.List>
				<Command.Empty>No groups found.</Command.Empty>
				<Command.Group>
					{#each groupNames as groups (groups)}
						<Command.Item
							value={groups}
							data-checked={value === groups}
							onSelect={() => {
								value = groups;
								closeAndFocusTrigger();
							}}
						>
							{groups}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
