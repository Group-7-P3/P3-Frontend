<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { enhance } from '$app/forms';
	import * as Field from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { resolve } from '$app/paths';


	let { data }: { data: PageData } = $props();
	let product = $derived(data.product);
	
	const statusOptions = [
		{ value: 'Active', label:'Active' },
		{ value: 'Inactive', label:'Inactive' },
		{ value: 'Deactivate', label:'Deactivate' }
	]
	
	let selectedStatus = $state(product.status);

</script>

<svelte:head>
	<title>Product ({product.serialNumber})</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-6">
	<Button variant="link">
		<a href={resolve('/(protected)/products')} class="text-sm text-muted-foreground hover:underline">
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
						{#if product.status == 'Active'}
							<Badge class="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
								>Active</Badge
							>
						{:else}
							<Badge class="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
								>Inactive</Badge
							>
						{/if}
					</dd>
				</div>

				<!-- Product Type -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Type</dt>
					<dd class="text-sm font-medium text-foreground">
						{product.type}
					</dd>
				</div>

				<!-- UserID -->
				<div class="flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">User ID</dt>
					<dd class="text-sm font-medium text-foreground">
						{product.userId}
					</dd>
				</div>
			</Card.Content>
		</Card.Root>

		<!------------------------------ Edit product  ------------------------------>
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title>Edit Product</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				<form method="POST" use:enhance class="space-y-4">
					<div class="flex items-center justify-between border-b py-2 last:border-0"> 
						<dt class="text-sm font-normal text-muted-foreground">Activity Status</dt>
						<dd class="text-sm font-medium text-foreground">
							<Select.Root type="single" name="status" bind:value={selectedStatus}>
								<Select.Trigger class="w-full max-w-48">
									<Select.Value/> 
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
				</form>
				<form>
					<div class="flex items-center justify-between border-b py-2 last:border-0">
						<dt class="text-sm font-normal text-muted-foreground">User ID</dt>
						<dd class="text-sm font-medium text-foreground">
							<Field.Field>
								<Input id="user-Id" type="userID" placeholder="Enter new User ID"/>	
							</Field.Field>
						</dd>
					</div>
				</form>
				<form>
					<div class="flex items-center justify-between border-b py-2 last:border-0">
						<dt class="text-sm font-normal text-muted-foreground">Type</dt>
						<dd class="text-sm font-medium text-foreground">
							<Field.Field>
								<Input id="type" type="types" placeholder="Enter new type" />
							</Field.Field>
						</dd>
					</div>
				</form>
					<div class="flex flex-wrap items-center gap-2 md:flex-row">
						<Button variant="destructive">Confirm edits</Button>
						<Button variant="secondary">Clear</Button>
					</div>
			</Card.Content>
		</Card.Root>

		<!------------------------------ Product Placeholder ------------------------------>
		<Card.Root class="md:col-span-3">
			<Card.Header>
				<Card.Title>placeholder</Card.Title>
			</Card.Header>
		</Card.Root>
	</div>
</div>
