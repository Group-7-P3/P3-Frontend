<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { enhance } from '$app/forms';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { resolve } from '$app/paths';
	import { wordsToTitleCase } from '$lib/utils';
	import { ExternalLink } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	let product = $derived(data.product);
	let selectedStatus = $derived(product.status);

	const statusOptions = [
		{ value: 'active', label: 'active' },
		{ value: 'inactive', label: 'inactive' },
		{ value: 'deactivated', label: 'deactivated' }
	];

	let selectedScope = $state('All Subscriptions');

	const licenseOptions = $derived([
		{ value: 'All', label: 'All Subscriptions' },
		...data.subscriptions.map((sub) => ({
			value: String(sub.licenseKey),
			label: sub.licenseKey
		}))
	]);
</script>

<svelte:head>
	<title>Product ({product.serialNumber})</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-6">
	<Button variant="link">
		<a
			href={resolve('/(protected)/products')}
			class="text-sm text-muted-foreground hover:underline"
		>
			&larr; Back to products
		</a>
	</Button>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
		<!------------------------------ Product Statistics ------------------------------>
		<Card.Root class="md:col-span-1">
			<Card.Header>
				<Card.Title>Product: {product.serialNumber}</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<!-- Serial Number -->
					<dt class="text-sm font-normal text-muted-foreground">Serial Number</dt>
					<dd class="text-sm font-medium text-foreground">
						{product.serialNumber}
					</dd>
				</div>

				<!-- Activity Status -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Activity Status</dt>
					<dd class="text-sm font-medium text-foreground">
						{#if product.status == 'active'}
							<Badge class="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
								Active
							</Badge>
						{:else if product.status == 'inactive'}
							<Badge class="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
								Inactive
							</Badge>
						{:else}
							<Badge class="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
								Deactivated
							</Badge>
						{/if}
					</dd>
				</div>

				<!-- Created at -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Created At</dt>
					<dd class="text-sm font-medium text-foreground">
						{product.createdAt}
					</dd>
				</div>

				<!-- Updated at -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Updated At</dt>
					<dd class="text-sm font-medium text-foreground">
						{product.updatedAt}
					</dd>
				</div>

				<!-- Subscripers -->
			</Card.Content>
		</Card.Root>

		<!------------------------------ Edit product  ------------------------------>
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title>Edit Product</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				<!------ Choose License key ------>
				<form method="POST" use:enhance class="space-y-4">
					<div class="flex items-center justify-between border-b py-2 last:border-0">
						<dt class="text-sm font-normal text-muted-foreground">Choose License key</dt>
						<dd class="text-sm font-normal text-foreground">
							<Field.Field>
								<Select.Root type="single" name="targetScope" bind:value={selectedScope}>
									<Select.Trigger class="w-full max-w-48">
										<Select.Value />
									</Select.Trigger>
									<Select.Content>
										{#each licenseOptions as option (option.value)}
											<Select.Item value={option.value} label={String(option.label)}>
												{option.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</Field.Field>
						</dd>
					</div>

					<!------ Activity Status ------>

					<div class="flex items-center justify-between border-b py-2 last:border-0">
						<dt class="text-sm font-normal text-muted-foreground">Activity Status</dt>
						<dd class="text-sm font-medium text-foreground">
							<Select.Root type="single" name="status" bind:value={selectedStatus}>
								<Select.Trigger class="w-full max-w-48">
									<Select.Value />
								</Select.Trigger>
								<Select.Content>
									{#each statusOptions as option (option.value)}
										<Select.Item value={option.value} label={option.label}>
											{option.label}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</dd>
					</div>

					<!------ Change license key ------>

					<div class="flex items-center justify-between border-b py-2 last:border-0">
						<dt class="text-sm font-normal text-muted-foreground">License key</dt>
						<dd class="text-sm font-medium text-foreground">
							<Field.Field class="border-b py-2 last:border-0">
								<Input id="licenseKey" type="text" placeholder="License key here" />
							</Field.Field>
						</dd>
					</div>

					<!------ Confirm button ------>
					<div class="flex flex-wrap items-center gap-2 md:flex-row">
						<Button variant="destructive" type="submit">Confirm edits</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>

		<!------------------------------ Product Placeholder ------------------------------>
		<Card.Root class="md:col-span-3">
			<Card.Header>
				<Card.Title>Subscriptions</Card.Title>
			</Card.Header>

			<Card.Content class="space-y-2">
				<!-- Subscriptions List -->
				{#if data.subscriptions && data.subscriptions.length > 0}
					<div class="flex flex-wrap gap-3">
						{#each data.subscriptions as sub, i (sub.licenseKey)}
							<dl class=" flex-1 basis-[calc(33.333%-0.75rem)] rounded-lg px-3.5 py-1">
								<!-- Subscription number -->
								<div class="flex items-center justify-between border-b py-2 last:border-0">
									<dt class="text-sm font-normal text-muted-foreground">Subscription Number</dt>
									<dd class="font-mono text-sm font-medium text-foreground">
										{i + 1}
									</dd>
								</div>

								<!-- License Key -->
								<div class="flex items-center justify-between border-b py-2 last:border-0">
									<dt class="text-sm font-normal text-muted-foreground">License Key</dt>
									<dd class="font-mono text-sm font-medium text-foreground">
										{sub.licenseKey}
										<Button
											variant="outline"
											size="icon-xs"
											onclick={() => {
												goto(
													resolve('/(protected)/subscriptions/[licenseKey]', {
														licenseKey: String(sub.licenseKey)
													})
												);
											}}
										>
											<ExternalLink />
										</Button>
									</dd>
								</div>

								<!-- Type -->
								<div class="flex items-center justify-between border-b py-2 last:border-0">
									<dt class="text-sm font-normal text-muted-foreground">Subscription Type</dt>
									<dd class="text-sm font-medium text-foreground">
										{wordsToTitleCase(sub.type)}
									</dd>
								</div>
							</dl>
						{/each}
					</div>
				{:else}
					<p class="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
						No subscriptions found for this user.
					</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
