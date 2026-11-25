<script lang="ts">
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { authClient } from '$lib/client.ts';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import { deserialize } from '$app/forms';
	import { refreshAll } from '$app/navigation';
	import { groupRules } from '#lib/utils.ts';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import GroupCombobox from './group-combobox.svelte';
	import type { PageData } from './$types';

	let { data, open = $bindable(false) }: { data: PageData; open: boolean } = $props();

	// Get user role for UI Elements
	const session = authClient.useSession();
	const role = $derived($session.data?.user?.role as 'owner' | 'admin' | 'supporter' | undefined);
	const group = $derived($session.data?.user?.group as 'INNOVAID' | undefined);

	// Variables binded to form openings
	// Open is binded to main form

	// Dialog open is binded to "are you sure?" dialog box.
	let dialogOpen = $state(false);
	// Was open is used to determine if the form needs to be reset.
	let wasOpen = false;

	// Store if staff should be admin, default is supporter
	let newStaffRole = $state('supporter');

	// Keeps track of whether the form has been submitted and if the password has changed.
	let formSubmitted = $state(false);

	// Keeps track of when form inputs have been touched.
	let newStaffNameTouched = $state(false);
	let newStaffEmailTouched = $state(false);
	let newStaffPasswordTouched = $state(false);
	let newRepeatStaffPasswordTouched = $state(false);
	let newStaffDistibutorGroupTouched = $state(false);

	// Keeps track of the inputs in the form.
	let newStaffName = $state('');
	let newStaffEmail = $state('');
	let newStaffPassword = $state('');
	let newRepeatStaffPassword = $state('');
	let newStaffDistributor = $state('');

	// Keeps track of whether the two main requirements have been met ('8 characters' and 'at least 3 of the following:').
	const lengthOk = $derived(newStaffPassword.length >= 8);
	const groupOk = $derived(groupRules.filter((r) => r.test(newStaffPassword)).length >= 3); // Counts how many subrequirements have been met and returns true if this count is 3 or above.

	// Keeps track of whether the password meets its requirements and whether the repeated password is correct.
	const newStaffPasswordOk = $derived(lengthOk && groupOk);
	const passwordRepeatOk = $derived(
		newStaffPassword !== '' && newStaffPassword === newRepeatStaffPassword
	);

	// Keeps track of the error status on each input field. Like whether the new password meets the requirements or whether the current password is correct.
	const newStaffPasswordError = $derived(
		(newStaffPasswordTouched || formSubmitted) && !newStaffPasswordOk
	);

	const repeatStaffPasswordError = $derived(
		(newRepeatStaffPasswordTouched || formSubmitted) && !passwordRepeatOk
	);

	// Keeps track of whether password rules status should be shown (colors, red/green)
	const showPasswordRulesStatus = $derived(newStaffPassword !== '' || formSubmitted);

	/**
	 * Colors a requirement green when it passes and red when it doesn't.
	 * Colors the fourth subrequirement grey with a line through if 3/4 subrequirements are already fulfilled (groupOk).
	 * @param passed Whether the requirement is passed or not.
	 * @param optional Whether the requirement is one of the 4 subrequirements.
	 */

	function ruleClass(passed: boolean, optional = false) {
		if (!showPasswordRulesStatus) return '';
		if (passed) return 'text-green-600';
		if (optional && groupOk && !passed) return 'line-through text-muted-foreground';
		return 'text-red-600';
	}

	const staffPasswordFormOk = $derived(newStaffPasswordOk && passwordRepeatOk);

	let errors = $state<Record<string, string>>({});
	let successMessage = $state('');

	//Resets the staff creation form.
	//Empties the input fields, clears errors and success messages and marks the password fields as untouched.
	function resetStaffForm() {
		// Reset all inputs
		newStaffName = '';
		newStaffEmail = '';
		newStaffPassword = '';
		newRepeatStaffPassword = '';
		newStaffRole = 'supporter';
		newStaffDistributor = '';
		errors = {};
		successMessage = '';
		//group = '';

		// Reset all touched inputs
		newStaffNameTouched = false;
		newStaffEmailTouched = false;
		newStaffPasswordTouched = false;
		newRepeatStaffPasswordTouched = false;
		newStaffDistibutorGroupTouched = false;
	}

	// Form submission handler for creating a new staff member
	async function handle(e: SubmitEvent) {
		e.preventDefault();
		// Stops the form from submitting if the password requirements are not met.
		if (!staffPasswordFormOk) return;
		errors = {};
		successMessage = '';
		// Sends the form data to the server and handles the response.
		const form = e.currentTarget as HTMLFormElement;
		const formData = new FormData(e.target as HTMLFormElement);
		const response = await fetch(form.action, {
			method: 'POST',
			body: formData,
			headers: { 'x-sveltekit-action': 'true' }
		});

		// Decodes the response from the server
		const result = deserialize(await response.text());

		// Stores the errors so they can be displayed in the form.
		if (result.type === 'failure') {
			errors = (result.data?.errors as Record<string, string>) ?? {};
		}

		// If the form submission was successful, resets the form, displays a success message and refreshes the staff list.
		if (result.type === 'success') {
			resetStaffForm();
			open = !open;
			successMessage = (result.data?.message as string) ?? 'User created successfully.';
			toast.success(successMessage);
			errors = {};
			await refreshAll();
		}
	}

	function formTouched() {
		if (
			newStaffNameTouched === true ||
			newStaffEmailTouched === true ||
			newStaffPasswordTouched === true ||
			newRepeatStaffPasswordTouched === true ||
			newStaffDistibutorGroupTouched === true
		) {
			return true;
		} else {
			return false;
		}
	}

	// Defines the cancelButton element, so it can be autofocused.
	let cancelButton = $state<HTMLButtonElement | null>(null);

	// Omit "are you sure?" dialog box, if form is not touched, and the escape key is pressed.
	function handleCloseDialogEscape(event: KeyboardEvent) {
		if (formTouched()) {
			event.preventDefault();
			dialogOpen = true;
		}
	}

	// Omit "are you sure?" dialog box, if form is not touched, and form is closed using close button.
	function handleCloseDialogClick() {
		if (formTouched()) {
			dialogOpen = true;
		} else {
			open = false;
		}
	}

	// Resets the form when the dialog is closed.
	$effect(() => {
		if (!open && wasOpen) {
			resetStaffForm();
		}
		wasOpen = open;
	});
</script>

<!-- Snippet for the checkmark/x bullets on the requirement list -->
<!-- ok is true when a requirement has passed and 'returns' a checkmark, if false an x is 'returned' -->
{#snippet bullet(ok: boolean)}
	{#if ok}
		<CheckIcon class="size-4" />
	{:else}
		<XIcon class="size-4" />
	{/if}
{/snippet}

<!-- Staff pop up dialog form-->
<Dialog bind:open>
	<!-- Define pop up behavior-->
	<DialogContent
		class="gap-2 sm:max-w-xl"
		// Make it ignore clicks outside
		interactOutsideBehavior="ignore"
		// If pressing escape, don't close the window but run this function instead
		// It opens a confirmation dialog
		onEscapeKeydown={handleCloseDialogEscape}
		// Remove  ShadCN's own closure button
		showCloseButton={false}
	>
		<!-- Closure X in corner -->
		<Button
			variant="ghost"
			class="absolute top-4 right-4"
			size="icon-sm"
			onclick={() => {
				handleCloseDialogClick();
			}}
		>
			<XIcon />
			<span class="sr-only">Close</span>
		</Button>

		<DialogHeader>
			<DialogTitle class="text-center text-2xl">Create a new staff member</DialogTitle>
		</DialogHeader>
		<Field.Group>
			<Field.Set>
				<Field.Legend></Field.Legend>
				<Field.Group class="gap-4">
					<Field.Field>
						<!-- Form begins here-->
						<form method="POST" action="?/createStaff" onsubmit={handle}>
							<Field.Set>
								<div class="flex gap-6">
									<Field.Group class="basis-2/3">
										<!-- Confirm closure pop up box -->
										<AlertDialog.Root bind:open={dialogOpen}>
											<AlertDialog.Content
												// Remove default auto focus and make it focus the cancel button, if it exists.
												onOpenAutoFocus={(e) => {
													e.preventDefault();
													cancelButton?.focus();
												}}
											>
												<AlertDialog.Header>
													<AlertDialog.Title>Proceed?</AlertDialog.Title>
													<AlertDialog.Description>
														Are you sure you want to close the form? <br /> All unsaved changes will be
														lost.
													</AlertDialog.Description>
												</AlertDialog.Header>
												<AlertDialog.Footer>
													<AlertDialog.Cancel type="button" bind:ref={cancelButton}
														>Cancel</AlertDialog.Cancel
													>
													<AlertDialog.Action
														class={buttonVariants({ variant: 'destructive' })}
														type="button"
														onclick={() => {
															dialogOpen = false;
															open = false;
														}}
													>
														Continue
													</AlertDialog.Action>
												</AlertDialog.Footer>
											</AlertDialog.Content>
										</AlertDialog.Root>

										<!-- Name field -->
										<Field.Field class="gap-1">
											<Field.Label for="newStaffName">Name</Field.Label>
											<Input
												id="newStaffName"
												name="newStaffName"
												bind:value={newStaffName}
												type="text"
												autocomplete="off"
												oninput={() => (newStaffNameTouched = true)}
												placeholder="e.g. John Smith"
											/>
											<!-- Error line below, fills in with error object from server, if any errors are present-->
											{#if errors.name}
												<Field.Error>{errors.name}</Field.Error>
											{/if}
										</Field.Field>
										<!--Repeat of previous structure-->
										<Field.Field class="gap-1">
											<Field.Label for="newStaffEmail">Email</Field.Label>
											<Input
												id="newStaffEmail"
												name="newStaffEmail"
												bind:value={newStaffEmail}
												type="email"
												oninput={() => (newStaffEmailTouched = true)}
												autocomplete="off"
												placeholder="example@mail.xyz"
											/>
											{#if errors.email}
												<Field.Error>{errors.email}</Field.Error>
											{/if}
										</Field.Field>
										<!-- Password structure, rewritten from settings-->
										<Field.Field class="gap-1">
											<Field.Label for="newStaffPassword">Password</Field.Label>
											<Input
												id="newStaffPassword"
												name="newStaffPassword"
												bind:value={newStaffPassword}
												type="password"
												autocomplete="off"
												oninput={() => (newStaffPasswordTouched = true)}
												// Set newStaffPasswordTouched to true when the user types in the field.
												aria-invalid={newStaffPasswordError}
												placeholder="New password"
											/>
											<!-- Shows password errors, if any local show those, else show send from server -->
											{#if newStaffPasswordError}
												<Field.Error>The password must fulfill all requirements</Field.Error>
											{:else if errors.password}
												<Field.Error>{errors.password}</Field.Error>
											{/if}
										</Field.Field>
										<!-- Repeat of previous structure-->
										<Field.Field class="gap-1">
											<Field.Label for="newRepeatStaffPassword">Repeat password</Field.Label>
											<Input
												id="newRepeatStaffPassword"
												name="repeatPassword"
												bind:value={newRepeatStaffPassword}
												type="password"
												autocomplete="off"
												placeholder="Match new password"
												oninput={() => (newRepeatStaffPasswordTouched = true)}
												// Set newRepeatStaffPasswordTouched to true when the user types in the field.
												aria-invalid={repeatStaffPasswordError}
											/>
											{#if repeatStaffPasswordError}
												<Field.Error>Passwords must match</Field.Error>
											{:else if errors.password}
												<Field.Error>{errors.password}</Field.Error>
											{/if}
										</Field.Field>
										<!-- INNOVAID only, input group for new staff -->
										{#if group === 'INNOVAID'}
											<Field.Field class="gap-1">
												<Field.Label>Choose Distributor group</Field.Label>
												<GroupCombobox {data} bind:value={newStaffDistributor} />
												<input
													type="hidden"
													name="newStaffDistributor"
													value={newStaffDistributor}
												/>
												<!-- Reports any errors back to the user -->
												{#if errors.group}
													<Field.Error>{errors.group}</Field.Error>
												{/if}
											</Field.Field>
										{/if}

										<!-- Owner only field, gives admin role to staff -->
										{#if role === 'owner'}
											<Field.Set class="w-full max-w-xs">
												<Field.Legend variant="label">Role</Field.Legend>
												<RadioGroup.Root
													bind:value={newStaffRole}
													name="newStaffRole"
													class="flex flex-col gap-2"
												>
													<Field.Field orientation="horizontal">
														<RadioGroup.Item value="supporter" id="newStaffRoleSupporter" />
														<Field.Label for="newStaffRoleSupporter" class="font-normal"
															>Supporter</Field.Label
														>
													</Field.Field>
													<Field.Field orientation="horizontal">
														<RadioGroup.Item value="admin" id="newStaffRoleAdmin" />
														<Field.Label for="newStaffRoleAdmin" class="font-normal"
															>Admin</Field.Label
														>
													</Field.Field>
												</RadioGroup.Root>
											</Field.Set>
										{/if}
										<!-- Reports general errors at bottom, i.e. if something goes wrong in actually creating the user -->
										{#if errors.general}
											<Field.Error class="text-center">{errors.general}</Field.Error>
										{/if}
										<!-- Reports a successfull creation back to the user -->
										{#if successMessage}
											<p class="text-center text-green-500">{successMessage}</p>
										{/if}
										<Button type="submit" class="w-full">Create staff account</Button>
									</Field.Group>
									<!-- Password rules -->
									<Field.Group class="basis-1/3">
										<div>
											<h3 class="mb-2 font-semibold">Password requirements</h3>
											<ul class="space-y-2 text-muted-foreground">
												<li class={['flex items-center gap-2', ruleClass(lengthOk, false)]}>
													{@render bullet(lengthOk)}
													<!-- Dynamic bullet depending on whether the requirement has been met -->
													At least 8 characters long
												</li>
												<li class={ruleClass(groupOk, false)}>
													<div class="flex items-center gap-2">
														{@render bullet(groupOk)}
														<!-- Dynamic bullet depending on whether the requirement has been met -->
														At least 3 of the following:
													</div>
													<ul class="mt-1.5 space-y-1 pl-6">
														{#each groupRules as rule (rule.id)}
															<!-- Creates a list item for each subrequirement -->
															{@const passed = rule.test(newStaffPassword)}
															<!-- Checks whether the current subrequirement has been met -->
															<li class={['flex items-center gap-2', ruleClass(passed, true)]}>
																<!-- Gets the color from ruleClass() -->
																{@render bullet(passed)}
																<!-- Dynamic bullet depending on whether the requirement has been met -->
																{rule.label}
															</li>
														{/each}
													</ul>
												</li>
											</ul>
										</div>
									</Field.Group>
								</div>
							</Field.Set>
						</form>
					</Field.Field>
				</Field.Group>
			</Field.Set>
		</Field.Group>
	</DialogContent>
</Dialog>
