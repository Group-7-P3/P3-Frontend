<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import { wordsToTitleCase } from '#lib/utils.ts';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { enhance } from '$app/forms';
	import * as Select from '$lib/components/ui/select/index.js';
	import { goto } from '$app/navigation';
	import { ExternalLink } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: { error?: string; success?: boolean } | null } =
		$props();

	const statusOptionsDistributor = [
		{ value: 'INNOVAID', label: 'INNOVAID' },
		{ value: 'Italy', label: 'Italy' },
		{ value: 'Norway', label: 'Norway' }
	];

	// Local form state initialized from data so editing doesn't mutate the left display card prematurely
	let editUserId = $state('');
	let editDistributor = $derived(data.user.managedBy ?? '');

	function clearForm() {
		editUserId = '';
		editDistributor = data.user.managedBy ?? '';
	}
</script>

<svelte:head>
	<title>User {data.user.id}</title>
</svelte:head>

<div class="w-full space-y-6 text-left">
	<!-- Back to Users link -->
	<Button variant="link" class="px-0">
		<a href={resolve('/(protected)/users')} class="text-sm text-muted-foreground hover:underline">
			&larr; Back to Users
		</a>
	</Button>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-5">
		<!-- Left Box: View Details -->
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title>
					Information for User {data.user.id}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<dl class="divide-y">
					<!-- Row 1: User ID -->
					<div class="flex h-14 items-center justify-between">
						<dt class="text-sm font-normal text-muted-foreground">User ID</dt>
						<dd class="font-mono text-sm font-medium text-foreground">
							{data.user.id}
						</dd>
					</div>

					<!-- Row 2: Distributor -->
					<div class="flex h-14 items-center justify-between">
						<dt class="text-sm font-normal text-muted-foreground">Distributor</dt>
						<dd class="text-sm font-medium text-foreground">
							{data.user.managedBy}
						</dd>
					</div>

					<div class="flex h-14 items-center justify-between">
						<dt class="text-sm font-normal text-muted-foreground">Created at:</dt>
						<dd class="text-sm font-medium text-foreground">
							{new Date(data.user.createdAt).toLocaleString('da-DK', {
								timeZone: 'Europe/Copenhagen',
								day: '2-digit',
								month: 'short',
								year: 'numeric'
							})}
						</dd>
					</div>
				</dl>
			</Card.Content>
		</Card.Root>

		<!-- Right Box: Edit Form -->
		<Card.Root class="md:col-span-3">
			<Card.Header>
				<Card.Title>Edit User</Card.Title>
			</Card.Header>
			<Card.Content>
				<form
					method="POST"
					use:enhance={() =>
						async ({ result, update }) => {
							await update();
							if (result.type === 'success') clearForm();
						}}
				>
					<dl class="divide-y">
						<!-- Row 1: User ID ) -->
						<div class="flex h-14 items-center justify-between gap-4">
							<dt class="text-sm font-normal text-muted-foreground">User ID</dt>
							<dd class="w-56">
								<Field.Field>
									<Input
										id="user-Id"
										name="userId"
										type="text"
										inputmode="numeric"
										bind:value={editUserId}
										placeholder="Enter new User ID"
									/>
									{#if form?.error}
										<Field.Error>{form.error}</Field.Error>
									{/if}
								</Field.Field>
							</dd>
						</div>

						<!-- Row 2: Distributor -->
						<div class="flex h-14 items-center justify-between gap-4">
							<dt class="text-sm font-normal text-muted-foreground">Distributor</dt>
							<dd class="w-56">
								<Select.Root type="single" name="managedBy" bind:value={editDistributor}>
									<Select.Trigger class="w-full">
										<Select.Value placeholder="Select distributor" />
									</Select.Trigger>
									<Select.Content>
										{#each statusOptionsDistributor as option (option.value)}
											<Select.Item value={option.value} label={option.label}>
												{option.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</dd>
						</div>
					</dl>
					<div class="flex items-center gap-2 pt-2">
						<Button type="button" variant="secondary" onclick={clearForm}>Clear</Button>
						<Button type="submit" variant="destructive">Confirm edits</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	</div>
	<!-- Bottom: Full Width Box -->
	<Card.Root class="md:col-span-5">
		<Card.Header>
			<Card.Title>Active Subscriptions</Card.Title>
		</Card.Header>

		<Card.Content>
			{#if data.subscriptions && data.subscriptions.length > 0}
				<div class="flex flex-wrap gap-4">
					{#each data.subscriptions as sub, i (sub.licenseKey)}
						<dl class="flex-1 basis-[calc(33.333%-0.75rem)] rounded-lg">
							<!-- Subscription Number -->
							<div class="flex items-center justify-between border-b last:border-0">
								<dt class="text-sm font-normal text-muted-foreground">Subscription Number</dt>
								<dd class="font-mono text-sm font-medium text-foreground">
									{i + 1}
									<!-- Button to go to subscription -->
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
