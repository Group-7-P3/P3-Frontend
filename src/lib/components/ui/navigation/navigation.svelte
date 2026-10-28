<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import NavigationProfile from './navigation-profile.svelte';
	import { House, CalendarClock, Users, Package, ShieldUser } from '@lucide/svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import ThemeSwitcher from '../theme-switcher.svelte';
	import { authClient } from '#lib/client.ts';

	const session = authClient.useSession();
	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Root collapsible="icon">
	<!-- <Sidebar.Header /> -->
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu>
				<!-- Dashboard Page Link -->
				<Sidebar.MenuItem>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props: tooltipProps })}
								<div {...tooltipProps}>
									<Sidebar.MenuButton isActive={page.url.pathname === '/'}>
										{#snippet child({ props })}
											<a href={resolve('/(protected)')} {...props}>
												<House />
												<span>Dashboard</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								</div>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="right" hidden={sidebar.state !== 'collapsed'}>
							<p>Dashboard</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Sidebar.MenuItem>

				<!-- Subscriptions Page Link -->
				<Sidebar.MenuItem>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props: tooltipProps })}
								<div {...tooltipProps}>
									<Sidebar.MenuButton isActive={page.url.pathname === '/subscriptions'}>
										{#snippet child({ props })}
											<a href={resolve('/(protected)/subscriptions')} {...props}>
												<CalendarClock />
												<span>Subscriptions</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								</div>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="right" hidden={sidebar.state !== 'collapsed'}>
							<p>Subscriptions</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Sidebar.MenuItem>

				<!-- Users Page Link -->
				<Sidebar.MenuItem>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props: tooltipProps })}
								<div {...tooltipProps}>
									<Sidebar.MenuButton isActive={page.url.pathname === '/users'}>
										{#snippet child({ props })}
											<a href={resolve('/(protected)/users')} {...props}>
												<Users />
												<span>Users</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								</div>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="right" hidden={sidebar.state !== 'collapsed'}>
							<p>Users</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Sidebar.MenuItem>

				<!-- Products Page Link -->
				<Sidebar.MenuItem>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props: tooltipProps })}
								<div {...tooltipProps}>
									<Sidebar.MenuButton isActive={page.url.pathname === '/products'}>
										{#snippet child({ props })}
											<a href={resolve('/(protected)/products')} {...props}>
												<Package />
												<span>Products</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								</div>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="right" hidden={sidebar.state !== 'collapsed'}>
							<p>Products</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Sidebar.MenuItem>

				<!-- Staff Page Link -->
				{#if $session.data?.user?.role === 'owner'}
					<Sidebar.MenuItem>
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props: tooltipProps })}
									<div {...tooltipProps}>
										<Sidebar.MenuButton isActive={page.url.pathname === '/staff'}>
											{#snippet child({ props })}
												<a href={resolve('/(protected)/staff')} {...props}>
													<ShieldUser />
													<span>Staff</span>
												</a>
											{/snippet}
										</Sidebar.MenuButton>
									</div>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content side="right" hidden={sidebar.state !== 'collapsed'}>
								<p>Staff</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Sidebar.MenuItem>
				{/if}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Menu>
			<ThemeSwitcher />
			<NavigationProfile />
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
