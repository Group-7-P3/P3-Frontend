<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';

	let { data }: { data: PageData } = $props();

	let product = $derived(data.product);
</script>

<svelte:head>
	<title>Product ({product.serialNumber})</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-6">
	<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
		<!-- Product Statistics -->
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

		<!-- Edit product Placeholder -->
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title>Edit Product</Card.Title>
				<Card.Action>
					<Button href="/products">Back</Button>
				</Card.Action>
			</Card.Header>
		</Card.Root>

		<!-- Product Placeholder -->
		<Card.Root class="md:col-span-3">
			<Card.Header>
				<Card.Title>placeholder</Card.Title>
			</Card.Header>
		</Card.Root>
	</div>
</div>
