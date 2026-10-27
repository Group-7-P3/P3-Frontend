<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
	import { ChevronsUpDown, LogOut, Cog } from '@lucide/svelte';
	import UnknownAvatar from '#lib/assets/profile-unknown.png';
	import { stringToHex } from '#lib/utils.ts';
	import { resolve } from '$app/paths';
	import { authClient } from '#lib/client.ts';
	import { goto } from '$app/navigation';

	const session = authClient.useSession();

	let email = $derived($session.data?.user?.email);
	let username = $derived($session.data?.user?.name);
	let shortname = $derived(username?.slice(0, 2).toUpperCase());
	let color = $derived(username ? stringToHex(username) : '#121212');
</script>

<Sidebar.MenuItem>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Sidebar.MenuButton
					{...props}
					size="lg"
					class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<Avatar class="h-8 w-8 overflow-clip rounded-full">
						<div style:background-color={color} class="p-0.5">
							<AvatarImage src={UnknownAvatar} alt={username} />
						</div>
						<AvatarFallback>{shortname}</AvatarFallback>
					</Avatar>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">{username}</span>
						<span class="truncate text-xs">{email}</span>
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
					<Avatar class="h-8 w-8 overflow-clip rounded-full">
						<div style:background-color={color} class="p-0.5">
							<AvatarImage src={UnknownAvatar} alt={username} />
						</div>
						<AvatarFallback>{shortname}</AvatarFallback>
					</Avatar>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">{username}</span>
						<span class="truncate text-xs">{email}</span>
					</div>
				</div>
			</DropdownMenu.Label>

			<DropdownMenu.Separator />

			<DropdownMenu.Group>
				<a href={resolve('/(protected)/settings')}>
					<DropdownMenu.Item>
						<Cog class="mr-2 size-4" />
						Settings
					</DropdownMenu.Item>
				</a>
			</DropdownMenu.Group>

			<DropdownMenu.Separator />

			<DropdownMenu.Item
				onSelect={async () => {
					await authClient.signOut({
						fetchOptions: {
							onSuccess: () => {
								goto(resolve('/(auth)/login'));
							}
						}
					});
				}}
			>
				<LogOut class="mr-2 size-4" />
				Log out
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</Sidebar.MenuItem>
