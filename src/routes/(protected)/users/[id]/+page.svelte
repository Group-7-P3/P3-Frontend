<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import { wordsToTitleCase } from '#lib/utils.ts';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>User {data.user.id}</title>
</svelte:head>
<!---->
<div class="w-full space-y-6 text-left">
	<!--Back to Users link-->
	<Button variant="link">
		<a href={resolve('/(protected)/users')} class="text-sm text-muted-foreground hover:underline">
			&larr; Back to Users
		</a>
	</Button>

	<div class="grid grid-cols-5 gap-3">
		<!-- Left Box: Subscription Box-->
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title class="text-lg font-extrabold">
					Subscriptions for User {data.user.id}
				</Card.Title>
			</Card.Header>

			<!--Subscription Metadata-->
			<Card.Content>
				<!-- Customer ID -->
				<dl>
					<div class="flex items-center justify-between border-b py-2">
						<dt class="text-sm font-normal text-muted-foreground">Customer ID</dt>
						<dd class="text-sm font-medium text-foreground">
							{data.user.customerId}
						</dd>
					</div>
				</dl>

				<!-- User ID -->
				<div class="flex items-center justify-between border-b py-2">
					<dt class="text-sm font-normal text-muted-foreground">Managed By</dt>
					<dd class="text-sm font-medium text-foreground">
						{data.user.managedBy}
					</dd>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Right Box New Side Box -->
		<Card.Root class="border-b md:col-span-3">
			<Card.Header class="flex items-center justify-between">
				<Card.Title class="text-lg font-extrabold">Lorum ipsum</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-sm text-muted-foreground">Dolor sit amet.</p>
			</Card.Content>
		</Card.Root>

		<!-- Bottom: Full Width Box -->
		<Card.Root class="md:col-span-5">
			<Card.Header class="flex items-center justify-between">
				<Card.Title class="text-lg font-extrabold">Active Subscriptions</Card.Title>
			</Card.Header>
			<Card.Content>
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
									</dd>
								</div>

								<!-- Type -->
								<div class="flex items-center justify-between border-b py-2 last:border-0">
									<dt class="text-sm font-normal text-muted-foreground">Subscription Type</dt>
									<dd class="text-sm font-medium text-foreground">
										{wordsToTitleCase(sub.type)}
									</dd>
								</div>

								<!-- Expires -->
								<div class="flex items-center justify-between border-b py-2 last:border-0">
									<dt class="text-sm font-normal text-muted-foreground">Expires</dt>
									<dd class="text-sm font-medium text-foreground">
										{sub.expiresAt}
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
