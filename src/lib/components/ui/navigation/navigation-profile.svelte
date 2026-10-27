<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
	import { ChevronsUpDown, LogOut, Cog } from '@lucide/svelte';
</script>

<Sidebar.MenuItem>
	<DropdownMenu.Root>
		<!-- Use Sidebar.MenuButton directly as the trigger using 'asChild' or snippet -->
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Sidebar.MenuButton
					{...props}
					size="lg"
					class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<Avatar class="h-8 w-8 rounded-lg">
						<AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
						<AvatarFallback class="rounded-lg">CN</AvatarFallback>
					</Avatar>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">shadcn</span>
						<span class="truncate text-xs">m@example.com</span>
					</div>
					<ChevronsUpDown class="ml-auto size-4" />
				</Sidebar.MenuButton>
			{/snippet}
		</DropdownMenu.Trigger>

		<DropdownMenu.Content
			class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
			side="right"
			align="end"
			sideOffset={4}
		>
			<DropdownMenu.Label class="p-0 font-normal">
				<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
					<Avatar class="h-8 w-8 rounded-lg">
						<AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
						<AvatarFallback class="rounded-lg">CN</AvatarFallback>
					</Avatar>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">shadcn</span>
						<span class="truncate text-xs">m@example.com</span>
					</div>
				</div>
			</DropdownMenu.Label>

			<DropdownMenu.Separator />

			<DropdownMenu.Group>
				<DropdownMenu.Item>
					<Cog class="mr-2 size-4" />
					Settings
				</DropdownMenu.Item>
			</DropdownMenu.Group>

			<DropdownMenu.Separator />

			<DropdownMenu.Item>
				<LogOut class="mr-2 size-4" />
				Log out
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</Sidebar.MenuItem>
