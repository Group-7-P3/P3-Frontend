<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>User #{data.user.id} Subscriptions</title>
</svelte:head>

<div class="max-w-10xl space-y-10">
	<!--Back to Users link-->
	<div>
		<a href={resolve('/(protected)/users')} class="text-sm text-muted-foreground hover:underline">
			&larr; Back to Users
		</a>
	</div>

	<!--Subscription Box-->
	<div class="space-y-5 rounded-xl border bg-card p-4 shadow-sm">
		<div class="flex items-center justify-between border-b pb-5">
			<h2 class="text-lg font-extrabold">
				Subscriptions for User #{data.user.id}
			</h2>
		</div>
		<div>
			<!--Subscription Metadata-->
			<span class="text-l text-muted-foreground">
				Customer ID: {data.user.customerId} | Managed By: {data.user.managedBy}
			</span>
		</div>
		{#if data.subscriptions && data.subscriptions.length > 0}
			<div class="grid gap-3">
				{#each data.subscriptions as sub (sub.licenseKey)}
					<div class="rounded-lg border bg-background p-4">
						<div>
							<p class="text-base font-semibold">
								License Key: #{sub.licenseKey} (Type: {sub.type})
							</p>
							<p class="text-xs text-muted-foreground">
								Max Devices: {sub.maxDevices} | Auto-Renew: {sub.autoRenew ? 'Yes' : 'No'}
							</p>
						</div>
						<div>
							<span class="rounded bg-secondary px-2 py-1 text-xs">
								Expires: {sub.expiresAt}
							</span>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">No subscriptions found for this user.</p>
		{/if}
	</div>
</div>
