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
	import { Copy, ExternalLink } from '@lucide/svelte';
	import DataTableDate from '$lib/components/ui/data-table/data-table-date.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Separator from '#lib/components/ui/separator/separator.svelte';
	import Badge from '#lib/components/ui/badge/badge.svelte';
	import { toast } from 'svelte-sonner';

	let { data, form }: { data: PageData; form: { error?: string; success?: boolean } | null } =
		$props();

	// Local form state initialized from data so editing doesn't mutate the left display card prematurely
	let editUserId = $state('');
	let editDistributor = $derived(data.user.managedBy ?? '');
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
		editDistributor = data.user.managedBy ?? '';
		clientError = null;
	}

	// Submits the actual changes to the user and closes the confirm dialog popup
	function submitEdits() {
		confirmDialogOpen = false;
		formElement?.requestSubmit();
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
					User: {data.user.id}
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				<!-- Row 1: User ID -->
				<div class="group flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">User ID</dt>
					<dd class="flex items-center gap-2 font-mono text-sm font-medium text-foreground">
						<Button
							variant="ghost"
							size="icon-xs"
							class="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
							onclick={async (e) => {
								e.stopPropagation();
								try {
									await navigator.clipboard.writeText(String(data.user.id));
									toast.success('Successfully copied to clipboard.');
								} catch {
									toast.error('Failed to copy to clipboard! Check browser permissions.');
								}
							}}
						>
							<Copy class="h-3 w-3" />
						</Button>
						{data.user.id}
					</dd>
				</div>

				<!-- Row 2: Distributor -->
				<div class="group flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Distributor</dt>
					<dd class="flex items-center gap-2 text-sm font-medium text-foreground">
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

				<!-- Row 3: Created at -->
				<div class="group flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Created at</dt>
					<dd class="flex items-center gap-2 text-sm font-medium text-foreground">
						<DataTableDate value={data.user.createdAt} />
					</dd>
				</div>

				<!-- Row 4: Updated at -->
				<div class="group flex items-center justify-between border-b py-2 last:border-0">
					<dt class="text-sm font-normal text-muted-foreground">Updated at</dt>
					<dd class="flex items-center gap-2 text-sm font-medium text-foreground">
						<DataTableDate value={data.user.updatedAt} />
					</dd>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Right Box: Edit Form -->
		<Card.Root class="md:col-span-3">
			<Card.Header>
				<Card.Title>Edit User</Card.Title>
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
						<!-- Row 1: User ID ) -->
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

						<Separator />

						<!-- Row 2: Distributor -->
						<div class="flex items-center justify-between gap-4">
							<dt class="text-sm font-normal text-muted-foreground">Distributor</dt>
							<dd class="w-56">
								<Select.Root type="single" name="managedBy" bind:value={editDistributor}>
									<Select.Trigger class="w-full">
										<Select.Value placeholder="Select distributor" />
									</Select.Trigger>
									<Select.Content>
										{#each data.distributors as distributors (distributors)}
											<Select.Item value={distributors} label={distributors}>
												{distributors}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
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
			<Card.Title>Active Subscriptions</Card.Title>
		</Card.Header>

		<Card.Content>
			{#if data.subscriptions && data.subscriptions.length > 0}
				<div class="grid grid-cols-[repeat(3,minmax(275px,1fr))] gap-4">
					{#each data.subscriptions as sub, i (sub.licenseKey)}
						<Card.Root class="relative flex-1 overflow-visible rounded-sm">
							<Badge class="absolute -top-2 -left-2 w-5">{i + 1}</Badge>
							<Card.Content>
								<dl class="grid gap-2">
									<!-- License Key -->
									<div class="flex items-center justify-between">
										<dt class="text-sm font-normal text-muted-foreground">License Key</dt>
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
														await navigator.clipboard.writeText(String(sub.licenseKey));
														toast.success('Successfully copied to clipboard.');
													} catch {
														toast.error('Failed to copy to clipboard! Check browser permissions.');
													}
												}}
											>
												<Copy class="h-3 w-3" />
											</Button>
											<span>{sub.licenseKey}</span>
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

									<Separator />

									<!-- Type -->
									<div class="flex items-center justify-between">
										<dt class="text-sm font-normal text-muted-foreground">Subscription Type</dt>
										<dd class="group text-sm font-medium text-foreground">
											<Button
												variant="ghost"
												size="icon-xs"
												class="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
												onclick={async (e) => {
													e.stopPropagation();
													try {
														await navigator.clipboard.writeText(
															new Intl.DateTimeFormat(undefined, {
																dateStyle: 'medium'
															}).format(new Date(data.user.updatedAt))
														);
														toast.success('Successfully copied to clipboard.');
													} catch {
														toast.error('Failed to copy to clipboard! Check browser permissions.');
													}
												}}
											>
												<Copy class="h-3 w-3" />
											</Button>
											{wordsToTitleCase(sub.type)}
										</dd>
									</div>

									<Separator />

									<!-- Expires -->
									<div class="flex items-center justify-between">
										<dt class="text-sm font-normal text-muted-foreground">Expires</dt>
										<dd class="text-sm font-medium text-foreground">
											<DataTableDate value={sub.expiresAt} />
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
			<AlertDialog.Action variant="outline" type="button" onclick={submitEdits}
				>Confirm changes</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
