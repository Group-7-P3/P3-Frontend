<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import { wordsToTitleCase } from '#lib/utils.ts';

	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>User ({data.user.id})</title>
</svelte:head>

<div class="w-full space-y-6 text-left">
	<!--Back to Users link-->
	<Button variant="link">
		<a href={resolve('/(protected)/users')} class="text-sm text-muted-foreground hover:underline">
			&larr; Back to Users
		</a>
	</Button>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-12">
		<!-- Left Box: Subscription Box-->
		<Card.Root class="md:col-span-5">
			<Card.Header>
				<Card.Title class="text-lg font-extrabold">
					Subscriptions for User #{data.user.id}
				</Card.Title>
				<Card.Description class="text-sm text-muted-foreground">
					Customer ID: {data.user.customerId} | Managed By: {data.user.managedBy}
				</Card.Description>
			</Card.Header>
			<Separator />
			<Card.Content class="space-y3">
				<!--Subscription Metadata-->
				{#if data.subscriptions && data.subscriptions.length > 0}
					<div class="grid gap-3">
						{#each data.subscriptions as sub (sub.licenseKey)}
							<div class="rounded-lg border bg-background p-4">
								<div>
									<p class="text-base font-semibold">
										License Key: #{sub.licenseKey} (Type: {wordsToTitleCase(sub.type)})
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
			</Card.Content>
		</Card.Root>

		<!-- Right Box New Side Box -->
		<Card.Root class="md:col-span-7">
			<Card.Header class="flex items-center justify-between border-b">
				<Card.Title class="text-lg font-extrabold">Lorum ipsum</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-sm text-muted-foreground">Dolor sit amet.</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Bottom: Full Width Box -->
	<Card.Root class="w-full space-y-4">
		<Card.Header class="flex items-center justify-between border-b">
			<Card.Title class="text-lg font-extrabold">Lorum ipsum</Card.Title>
		</Card.Header>
		<Card.Content>
			<p class="text-sm text-muted-foreground">Dolor sit amet.</p>
		</Card.Content>
	</Card.Root>
</div>
