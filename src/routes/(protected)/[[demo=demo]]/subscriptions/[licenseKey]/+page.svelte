<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import { wordsToTitleCase } from '#lib/utils.ts';
	import { Copy, ExternalLink } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	import { enhance } from '$app/forms';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import DataTableDate from '#lib/components/ui/data-table/data-table-date.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Separator from '#lib/components/ui/separator/separator.svelte';
	import Badge from '#lib/components/ui/badge/badge.svelte';
	import { toast } from 'svelte-sonner';

	let { data, form }: { data: PageData; form: { error?: string; success?: boolean } | null } =
		$props();

	// Local form state initialized from data so editing doesn't mutate the left display card prematurely
	let editUserId = $state('');
	let clientError = $state<string | null>(null);

	let formElement = $state<HTMLFormElement | null>(null);
	let confirmDialogOpen = $state(false);
	let userIdError = $derived(clientError ?? form?.error ?? null);

	// Validates the userId by checking is the new userId is a nonnegative number
	function validateUserId(): boolean {
		const trimmed = editUserId.trim();
		if (!trimmed) {
			clientError = null;
			return true;
		}
		if (!/^\d+$/.test(trimmed) || Number(trimmed) <= 0) {
			clientError = 'User ID must be a number';
			return false;
		}
		if (Number(trimmed) === data.user.id) {
			clientError = 'New User ID cannot be the same';
			return false;
		}
		clientError = null;
		return true;
	}

	// Opens the confirm popup if the new userId is validated
	function openConfirmDialog() {
		if (!validateUserId()) return;
		confirmDialogOpen = true;
	}

	// Clears the userId dialog box and the distributor dropdown
	function clearForm() {
		editUserId = '';
		clientError = null;
	}

	// Submits the actual changes to the user and closes the confirm dialog popup
	function submitEdits() {
		confirmDialogOpen = false;
		formElement?.requestSubmit();
		editUserId = '';
	}
</script>

<svelte:head>
	<title>Subscription ({data.subscription.licenseKey})</title>
</svelte:head>

<div class="w-full space-y-6 text-left">
	<!-- Back to Subscriptions link -->
	<Button variant="link" class="px-0">
		<a
			href={resolve('/(protected)/[[demo=demo]]/subscriptions', { demo: data.demo })}
			class="text-sm text-muted-foreground hover:underline"
		>
			&larr; Back to Subscriptions
		</a>
	</Button>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-5">
		<!-- Left Box: View Details -->
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title>
					Subscription: {data.subscription.licenseKey}
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				<!-- License key -->
				<div class="flex items-center justify-between">
					<dt class="text-sm font-normal text-muted-foreground">License key</dt>
					<dd class="group font-mono text-sm font-medium text-foreground">
						<Button
							variant="ghost"
							size="icon-xs"
							class="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
							onclick={async (e) => {
								e.stopPropagation();
								try {
									await navigator.clipboard.writeText(String(data.subscription.licenseKey));
									toast.success('Successfully copied to clipboard.');
								} catch {
									toast.error('Failed to copy to clipboard! Check browser permissions.');
								}
							}}
						>
							<Copy class="h-3 w-3" />
						</Button>
						{data.subscription.licenseKey}
					</dd>
				</div>

				<Separator />

				<!-- Customer ID -->
				<div class="flex items-center justify-between">
					<dt class="text-sm font-normal text-muted-foreground">Customer ID</dt>
					<dd class="group font-mono text-sm font-medium text-foreground">
						<Button
							variant="ghost"
							size="icon-xs"
							class="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
							onclick={async (e) => {
								e.stopPropagation();
								try {
									await navigator.clipboard.writeText(String(data.subscription.customerId));
									toast.success('Successfully copied to clipboard.');
								} catch {
									toast.error('Failed to copy to clipboard! Check browser permissions.');
								}
							}}
						>
							<Copy class="h-3 w-3" />
						</Button>
						{data.subscription.customerId}
					</dd>
				</div>

				<Separator />

				<!-- User ID -->
				<div class="flex items-center justify-between">
					<dt class="text-sm font-normal text-muted-foreground">User ID</dt>
					<dd class="group font-mono text-sm font-medium text-foreground">
						<Button
							variant="ghost"
							size="icon-xs"
							class="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
							onclick={async (e) => {
								e.stopPropagation();
								try {
									await navigator.clipboard.writeText(String(data.subscription.userId));
									toast.success('Successfully copied to clipboard.');
								} catch {
									toast.error('Failed to copy to clipboard! Check browser permissions.');
								}
							}}
						>
							<Copy class="h-3 w-3" />
						</Button>
						{data.subscription.userId}
						<Button
							variant="outline"
							size="icon-xs"
							onclick={() => {
								goto(
									resolve('/(protected)/[[demo=demo]]/users/[id]', {
										demo: data.demo,
										id: String(data.subscription.userId)
									})
								);
							}}
						>
							<ExternalLink />
						</Button>
					</dd>
				</div>

				<Separator />

				<!-- Type -->
				<div class="flex items-center justify-between">
					<dt class="text-sm font-normal text-muted-foreground">Type</dt>
					<dd class="font-mono text-sm font-medium text-foreground">
						{wordsToTitleCase(data.subscription.type)}
					</dd>
				</div>

				<Separator />

				<!-- Created at -->
				<div class="flex items-center justify-between">
					<dt class="text-sm font-normal text-muted-foreground">Created at:</dt>
					<dd class="text-sm font-medium text-foreground">
						<DataTableDate value={data.subscription.createdAt} />
					</dd>
				</div>

				<Separator />

				<!-- Updated at -->
				<div class="flex items-center justify-between">
					<dt class="text-sm font-normal text-muted-foreground">Updated at:</dt>
					<dd class="text-sm font-medium text-foreground">
						<DataTableDate value={data.subscription.updatedAt} />
					</dd>
				</div>

				<Separator />

				<!-- Expires at -->
				<div class="flex items-center justify-between">
					<dt class="text-sm font-normal text-muted-foreground">Expires at:</dt>
					<dd class="text-sm font-medium text-foreground">
						<DataTableDate value={data.subscription.expiresAt} />
					</dd>
				</div>

				<Separator />

				<!-- Distributor -->
				<div class="flex items-center justify-between">
					<dt class="text-sm font-normal text-muted-foreground">Distributor</dt>
					<dd class="group text-sm font-medium text-foreground">
						<Button
							variant="ghost"
							size="icon-xs"
							class="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
							onclick={async (e) => {
								e.stopPropagation();
								try {
									await navigator.clipboard.writeText(String(data.user.managedBy));
									toast.success('Successfully copied to clipboard.');
								} catch {
									toast.error('Failed to copy to clipboard! Check browser permissions.');
								}
							}}
						>
							<Copy class="h-3 w-3" />
						</Button>
						{data.user.managedBy}
					</dd>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Right Box: Edit Form -->
		<Card.Root class="md:col-span-3">
			<Card.Header>
				<Card.Title>Edit Subscription</Card.Title>
			</Card.Header>
			<Card.Content>
				<form
					bind:this={formElement}
					method="POST"
					use:enhance={() =>
						async ({ result, update }) => {
							await update();
							if (result.type === 'success') clearForm();
						}}
				>
					<dl class="grid gap-4">
						<!-- User ID -->
						<div class="flex items-center justify-between gap-4">
							<dt class="text-sm font-normal text-muted-foreground">User ID</dt>
							<dd class="w-56">
								<Field.Field>
									<Input
										id="user-Id"
										name="userId"
										type="text"
										inputmode="numeric"
										bind:value={editUserId}
										oninput={() => {
											if (clientError) validateUserId();
										}}
										placeholder="Enter new User ID"
									/>
									{#if userIdError}
										<Field.Error>{userIdError}</Field.Error>
									{/if}
								</Field.Field>
							</dd>
						</div>
					</dl>
				</form>
			</Card.Content>
			<Card.Footer class="flex items-center gap-2">
				<Button type="button" variant="outline" onclick={openConfirmDialog}>Confirm Edits</Button>
			</Card.Footer>
		</Card.Root>
	</div>
	<!-- Bottom: Full Width Box -->
	<Card.Root class="md:col-span-5">
		<Card.Header>
			<Card.Title>Products</Card.Title>
		</Card.Header>

		<Card.Content>
			{#if data.products && data.products.length > 0}
				<div class="grid grid-cols-[repeat(3,minmax(275px,1fr))] gap-4">
					{#each data.products as product, i (product.serialNumber)}
						<Card.Root class="relative flex-1 overflow-visible rounded-sm">
							<Badge class="absolute -top-2 -left-2 w-5">{i + 1}</Badge>
							<Card.Content>
								<dl class="grid gap-2">
									<!-- Serial Number -->
									<div class="flex items-center justify-between">
										<dt class="text-sm font-normal text-muted-foreground">Serial Number</dt>
										<dd
											class="group inline-flex items-center gap-2 font-mono text-sm font-medium text-foreground"
										>
											<Button
												variant="ghost"
												size="icon-xs"
												class="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
												onclick={async (e) => {
													e.stopPropagation();
													try {
														await navigator.clipboard.writeText(String(product.licenseKey));
														toast.success('Successfully copied to clipboard.');
													} catch {
														toast.error('Failed to copy to clipboard! Check browser permissions.');
													}
												}}
											>
												<Copy class="h-3 w-3" />
											</Button>
											<span>{product.licenseKey}</span>
											<!-- Button to go to product -->
											<Button
												variant="outline"
												size="icon-xs"
												onclick={() => {
													goto(
														resolve('/(protected)/[[demo=demo]]/products/[serialNumber]', {
															demo: data.demo,
															serialNumber: String(product.serialNumber)
														})
													);
												}}
											>
												<ExternalLink />
											</Button>
										</dd>
									</div>
								</dl>
							</Card.Content>
						</Card.Root>
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

<!-- Confirm Edits Dialog -->
<AlertDialog.Root bind:open={confirmDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Confirm user changes?</AlertDialog.Title>
			<AlertDialog.Description>This action will update the user.</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
			<AlertDialog.Action variant="destructive" type="button" onclick={submitEdits}
				>Confirm changes</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
