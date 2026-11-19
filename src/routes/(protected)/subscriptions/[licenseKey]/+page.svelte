<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import { ExternalLink } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	import { enhance } from '$app/forms';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	let { data }: { data: PageData } = $props();

	let subscription = $derived(data.subscription);
	let products = $derived(data.products);
	let user = $derived(data.user);

	const statusOptionsType = [
		{ value: 'home', label: 'home' },
		{ value: 'home+', label: 'home+' },
		{ value: 'pro', label: 'pro' },
		{ value: 'pro+', label: 'pro+' }
	];
	// svelte-ignore state_referenced_locally
	let selectedStatusType = $state(subscription.type);

	const statusOptionsManagedBy = [
		{ value: 'INNOVAID', label: 'INNOVAID' },
		{ value: 'Italy', label: 'Italy' },
		{ value: 'Norway', label: 'Norway' }
	];
	// svelte-ignore state_referenced_locally
	let selectedStatusManagedBy = $state(user.managedBy);
</script>

<svelte:head>
	<title>Subscription ({subscription.licenseKey})</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-6">
	<Button variant="link">
		<a
			href={resolve('/(protected)/subscriptions')}
			class="text-sm text-muted-foreground hover:underline"
		>
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
					<dt class="text-sm font-normal text-muted-foreground">Customer ID</dt>
					<dd class="text-sm font-medium text-foreground">
						{subscription.customerId}
					</dd>
				</div>

				<!-- Subscription Type -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Type</dt>
					<dd class="text-sm font-medium text-foreground">
						{subscription.type}
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
				<Card.Content class="space-y-2">
					<form method="POST" use:enhance class="space-y-4">
						<!-- User ID -->
						<div class="flex items-center justify-between border-b py-2 last:border-0">
							<dt class="text-sm font-normal text-muted-foreground">User ID</dt>
							<dd class="text-sm font-medium text-foreground">
								<Field.Field>
									<Input id="user-Id" type="userID" placeholder="Enter new User ID" />
								</Field.Field>
							</dd>
						</div>
						<!-- Type -->
						<div class="flex items-center justify-between border-b py-2 last:border-0">
							<dt class="text-sm font-normal text-muted-foreground">Type</dt>
							<dd class="text-sm font-medium text-foreground">
								<Select.Root type="single" name="status" bind:value={selectedStatusType}>
									<Select.Trigger class="w-full max-w-48">
										<Select.Value />
									</Select.Trigger>
									<Select.Content>
										{#each statusOptionsType as option (option.value)}
											<Select.Item value={option.value} label={option.label}>
												{option.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</dd>
						</div>
						<!-- Max Devices -->
						<div class="flex items-center justify-between border-b py-2 last:border-0">
							<dt class="text-sm font-normal text-muted-foreground">Max Devices</dt>
							<dd class="text-sm font-medium text-foreground">
								<Field.Field>
									<Input id="user-Id" type="userID" placeholder="Enter Max Devices" />
								</Field.Field>
							</dd>
						</div>
						<!-- Created At -->
						<div class="flex items-center justify-between border-b py-2 last:border-0">
							<dt class="text-sm font-normal text-muted-foreground">Created At</dt>
							<dd class="text-sm font-medium text-foreground">Calender missing for now</dd>
						</div>
						<!-- Updated At -->
						<div class="flex items-center justify-between border-b py-2 last:border-0">
							<dt class="text-sm font-normal text-muted-foreground">Updated At</dt>
							<dd class="text-sm font-medium text-foreground">Calender missing for now</dd>
						</div>
						<!-- Expires At -->
						<div class="flex items-center justify-between border-b py-2 last:border-0">
							<dt class="text-sm font-normal text-muted-foreground">Expires At</dt>
							<dd class="text-sm font-medium text-foreground">Calender missing for now</dd>
						</div>
						<!-- Managed By -->
						<div class="flex items-center justify-between border-b py-2 last:border-0">
							<dt class="text-sm font-normal text-muted-foreground">Managed By</dt>
							<dd class="text-sm font-medium text-foreground">
								<Select.Root type="single" name="status" bind:value={selectedStatusManagedBy}>
									<Select.Trigger class="w-full max-w-48">
										<Select.Value />
									</Select.Trigger>
									<Select.Content>
										{#each statusOptionsManagedBy as option (option.value)}
											<Select.Item value={option.value} label={option.label}>
												{option.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</dd>
						</div>
					</form>
					<div class="flex flex-wrap items-center gap-2 md:flex-row">
						<Button variant="destructive">Confirm edits</Button>
						<Button variant="secondary">Clear</Button>
					</div>
				</Card.Content>
			</Card.Header>
		</Card.Root>

		<!-- Products -->
		<Card.Root class="md:col-span-5">
			<Card.Header class="flex items-center justify-between">
				<Card.Title class="text-lg font-extrabold">Products</Card.Title>
			</Card.Header>

			<Card.Content class="grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-3">
				{#each products as product, i (product.serialNumber)}
					<div class="border-b">
						Product {i + 1}
						<div class="flex items-center justify-between py-2">
							<dt class="text-sm font-normal text-muted-foreground">Serial Number</dt>
							<dd class="text-sm font-medium text-foreground">
								{product.serialNumber}
								<Button
									variant="outline"
									size="icon-xs"
									onclick={() => {
										goto(
											resolve('/(protected)/products/[serialNumber]', {
												serialNumber: String(product.serialNumber)
											})
										);
									}}
								>
									<ExternalLink />
								</Button>
							</dd>
						</div>
					</div>
				{/each}
				{#if products.length === 0}
					<dt class="text-sm font-normal text-muted-foreground">
						This subscription has no products.
					</dt>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
