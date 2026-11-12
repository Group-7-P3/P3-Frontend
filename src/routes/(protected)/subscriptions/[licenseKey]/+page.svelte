<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge/index.js';

	let { data }: { data: PageData } = $props();

	let subscription = $derived(data.subscription);
	let products = $derived(data.products);
	let user = $derived(data.user);
</script>

<svelte:head>
	<title>Subscription ({subscription.licenseKey})</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-6">
	<Button variant="link">
        <a href={resolve('/(protected)/subscriptions')} class="text-sm text-muted-foreground hover:underline">
        &larr; Back to subscriptions
        </a>
	</Button>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
		<!-- Subscription Statistics -->
		<Card.Root class="md:col-span-1">
			<Card.Header>
				<Card.Title>Subscription: {subscription.licenseKey}</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<!-- License Key -->
					<dt class="text-sm font-normal text-muted-foreground">License Key</dt>
					<dd class="text-sm font-medium text-foreground">
						{subscription.licenseKey}
					</dd>
				</div>
			
				<!-- Subscription User Index -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">User Index</dt>
					<dd class="text-sm font-medium text-foreground">
						{subscription.userId}
					</dd>
				</div>

				<!-- Subscription Type -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Type</dt>
					<dd class="text-sm font-medium text-foreground">
						{subscription.type}
					</dd>
				</div>

				<!-- Subscription Max Devices -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Max Devices</dt>
					<dd class="text-sm font-medium text-foreground">
						{subscription.maxDevices}
					</dd>
				</div>

				<!-- Subscription Created At -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Created At</dt>
					<dd class="text-sm font-medium text-foreground">
						{subscription.createdAt}
					</dd>
				</div>

				<!-- Subscription Updated At -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Updated At</dt>
					<dd class="text-sm font-medium text-foreground">
						{subscription.updatedAt}
					</dd>
				</div>

				<!-- Subscription Expires At -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Expires At</dt>
					<dd class="text-sm font-medium text-foreground">
						{subscription.expiresAt}
					</dd>
				</div>

				<!-- Subscription Auto Renew -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Auto Renew</dt>
					<dd class="text-sm font-medium text-foreground">
						{#if subscription.autoRenew}
							<Badge class="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
								>Yes</Badge
							>
						{:else}
							<Badge class="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
								>No</Badge
							>
						{/if}
					</dd>
				</div>

				<!-- Subscription Managed By -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Managed By</dt>
					<dd class="text-sm font-medium text-foreground">
						{user.managedBy}
					</dd>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Edit Subscription Placeholder -->
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title>Edit Subscription</Card.Title>
				<Card.Action>
					
				</Card.Action>
			</Card.Header>
		</Card.Root>

		<!-- Products -->
		<Card.Root class="md:col-span-1">
			<Card.Header>
				<Card.Title>Products</Card.Title>
			</Card.Header>

			<Card.Content class="space-y-2">
				{#each products as product, i (product.serialNumber)}
					<div>
					Product {i + 1}
						<div class="flex items-center justify-between border-b py-2 last:border-0">
							<dt class="text-sm font-normal text-muted-foreground">Serial Number</dt>
							<dd class="text-sm font-medium text-foreground">
							<a href={resolve('/(protected)/products/[serialNumber]', { serialNumber: String(product.serialNumber) })} class="text-sm text-muted-foreground hover:underline">
							{product.serialNumber}
							</a>
							</dd>
						</div>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>
</div>