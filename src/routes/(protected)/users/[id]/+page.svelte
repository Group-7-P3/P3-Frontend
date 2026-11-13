<script lang="ts">
	import type { PageData } from './$types';
	import { enhance, type SubmitFunction } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { resolve } from '$app/paths';
	import { wordsToTitleCase } from '#lib/utils.ts';

	let { data }: { data: PageData } = $props();

	// Controls whether the edit popup is visible
	let isEditing = $state(false);

	// Keep track on if the form has been submitted
	let submitted = $state(false);

	// Keeps track of when form inputs have been touched ;)
	let customerIdTouched = $state(false);
	let managedByTouched = $state(false);

	// keeps track of the inputs in the form
	let customerId = $state('');
	let managedBy = $state('');
	// Keeps track of duplicate id error and general errors
	let customerIdDuplicate = $state(false);
	let formError = $state('');

	// Validation rules for each field in the form
	const customerIdOk = $derived(customerId.trim() !== '' && !customerIdDuplicate);
	const managedByOk = $derived(managedBy.trim() !== '');
	const formOk = $derived(customerIdOk && managedByOk);

	// shows field errors only after  th input has been touched/submitted
	const customerIdError = $derived((customerIdTouched || submitted) && !customerIdOk);
	const managedByError = $derived((managedByTouched || submitted) && !managedByOk);

	/**
	 * Takes the user's current values and puts it in the form
	 * Also resets validation states, and opens the edit popup
	 */
	function openEdit() {
		customerId = data.user.customerId != null ? String(data.user.customerId) : '';
		managedBy = data.user.managedBy ?? '';
		submitted = false;
		customerIdTouched = false;
		managedByTouched = false;
		customerIdDuplicate = false;
		formError = '';
		isEditing = true;
	}

	/* validates the form before sending to the server
	 * Also displays duplicate errors if rejected or refreshes page data and closes the popup on success
	 */
	const handleUserSubmit: SubmitFunction = ({ cancel }) => {
		submitted = true;
		if (!formOk) {
			cancel();
			return;
		}

		formError = '';

		return async ({ result, update }) => {
			if (result.type === 'failure') {
				if (result.data?.customerIdDuplicate) {
					customerIdDuplicate = true;
				}
				return;
			}
			if (result.type !== 'success') {
				formError = 'Something went wrong. Please try again';
				return;
			}

			await update();
			isEditing = false;
		};
	};
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
				<Button variant="outline" size="sm" onclick={openEdit}>Edit</Button>
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

<!-- Edit Popup -->
{#if isEditing}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<Card.Root class="w-full max-w-md px-6">
			<form method="POST" action="?/updateUser" use:enhance={handleUserSubmit}>
				<Field.Set>
					<Field.Legend>Edit User #{data.user.id}</Field.Legend>
					<Field.Group>
						<Field.Field>
							<Field.Label for="customerId">Customer ID</Field.Label>
							<Input
								id="customerId"
								name="customerId"
								type="text"
								inputmode="numeric"
								bind:value={customerId}
								autocomplete="off"
								onblur={() => (customerIdTouched = true)}
								oninput={() => {
									customerIdDuplicate = false;
									formError = '';
								}}
								aria-invalid={customerIdError}
							/>
							{#if customerIdError}
								<Field.Error>
									{customerIdDuplicate
										? 'This Customer ID is already in use'
										: 'Please enter a valid Customer ID'}
								</Field.Error>
							{/if}
						</Field.Field>

						<Field.Field>
							<Field.Label for="managedBy">Managed By</Field.Label>
							<Input
								id="managedBy"
								name="managedBy"
								type="text"
								bind:value={managedBy}
								autocomplete="off"
								onblur={() => (managedByTouched = true)}
								oninput={() => (formError = '')}
								aria-invalid={managedByError}
							/>
							{#if managedByError}
								<Field.Error>Please enter who manages this user</Field.Error>
							{/if}
						</Field.Field>

						{#if formError}
							<Field.Error>{formError}</Field.Error>
						{/if}

						<div class="flex gap-2">
							<Button
								type="button"
								variant="outline"
								class="w-1/2"
								onclick={() => (isEditing = false)}
							>
								Cancel
							</Button>
							<Button type="submit" class="w-1/2">Save changes</Button>
						</div>
					</Field.Group>
				</Field.Set>
			</form>
		</Card.Root>
	</div>
{/if}
