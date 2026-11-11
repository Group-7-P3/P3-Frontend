<script lang="ts">
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { authClient } from '$lib/client.ts';
	//import { authClient } from '$lib/auth-client';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	//import { moderator } from '../../(auth)/permissions';

	// Get user role for UI Elements
	const session = authClient.useSession();
	const role = $derived($session.data?.user?.role as 'owner' | 'admin' | 'moderator' | undefined);

	// Make open bindable
	let { open = $bindable(false) }: { open: boolean } = $props();

	// Store if staff should be admin, default is moderator
	let makeAdmin = $state(false);

	// Keeps track of whether the form has been submitted and if the password has changed.
	let passwordSubmitted = $state(false);

	// Holds the thrown error, if any, after submitting the form.
	let passwordFormError = $state('');

	// Keeps track of when form inputs have been touched.
	let newStaffPasswordTouched = $state(false);
	let newRepeatStaffPasswordTouched = $state(false);

	// Keeps track of the inputs in the form.
	let newStaffName = $state('');
	let newStaffEmail = $state('');
	let newStaffPassword = $state('');
	let newRepeatStaffPassword = $state('');

	// Rules for new passwords, uses regex to determine if strings include for example a number.
	const groupRules = [
		{
			id: 'uppercase',
			label: 'An uppercase letter',
			test: (pw: string) => /[A-Z]/.test(pw)
		},
		{
			id: 'lowercase',
			label: 'A lowercase letter',
			test: (pw: string) => /[a-z]/.test(pw)
		},
		{
			id: 'number',
			label: 'A number',
			test: (pw: string) => /[0-9]/.test(pw)
		},
		{
			id: 'symbol',
			label: 'A symbol',
			test: (pw: string) => /[^A-Za-z0-9]/.test(pw)
		}
	];

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
		(newStaffPasswordTouched || passwordSubmitted) && !newStaffPasswordOk
	);

	const repeatStaffPasswordError = $derived(
		(newRepeatStaffPasswordTouched || passwordSubmitted) && !passwordRepeatOk
	);

	// Keeps track of whether password rules status should be shown (colors, red/green)
	const showPasswordRulesStatus = $derived(newStaffPassword !== '' || passwordSubmitted);

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

	/**
	 * Resets the staff creation form.
	 * Empties the input fields and marks them 'not touched'.
	 */
	/*
		function resetStaffForm() {
		newStaffPassword = '';
		newRepeatStaffPassword = '';
		password = '';
		passwordSubmitted = false;

		newStaffPasswordTouched = false;
		newRepeatStaffPasswordTouched = false;
		passwordTouched = false;
	}	
*/

	// Form submission handler for creating a new staff member
	/*
	async function handle(e: SubmitEvent) {
		e.preventDefault();
/*
		type Role = 'moderator' | 'admin';
		let assignedRole: Role = 'moderator';

		if (makeAdmin == true) {
			assignedRole = 'admin';
		}

			newStaffEmail // required, The email of the user.
			newStaffPassword // required, The password of the user.
			newStaffName // required, The name of the user.
			assignedRole // A string or array of strings representing the roles to apply to the new user.

	}*/
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
<Dialog bind:open>
	<DialogContent class="gap-2 sm:max-w-xl">
		<DialogHeader>
			<DialogTitle class="text-center text-2xl">Create a new staff member</DialogTitle>
		</DialogHeader>
		<Field.Group>
			<Field.Set>
				<Field.Legend></Field.Legend>
				<Field.Group class="gap-4">
					<Field.Field>
						<form method="POST" action="?/createStaff">
							<Field.Set>
								<div class="flex gap-6">
									<Field.Group class="basis-2/3">
										<Field.Field class="gap-1">
											<Field.Label for="newStaffName">Name</Field.Label>
											<Input
												id="newStaffName"
												name="newStaffName"
												bind:value={newStaffName}
												type="text"
												autocomplete="off"
												placeholder="e.g. John Smith"
											/>
										</Field.Field>
										<Field.Field class="gap-1">
											<Field.Label for="newStaffEmail">Email</Field.Label>
											<Input
												id="newStaffEmail"
												name="newStaffEmail"
												bind:value={newStaffEmail}
												type="email"
												autocomplete="off"
												placeholder="example@mail.xyz"
											/>
										</Field.Field>
										<Field.Field class="gap-1">
											<Field.Label for="newStaffPassword">Password</Field.Label>
											<Input
												id="newStaffPassword"
												name="newStaffPassword"
												bind:value={newStaffPassword}
												type="password"
												autocomplete="off"
												onblur={() => (newStaffPasswordTouched = true)}
												// Set newStaffPasswordTouched to true when the user leaves the input field.
												aria-invalid={newStaffPasswordError}
												placeholder="New password"
											/>
											{#if newStaffPasswordError}
												<Field.Error>The password must fulfill all requirements</Field.Error>
											{/if}
										</Field.Field>
										<Field.Field class="gap-1">
											<Field.Label for="newRepeatStaffPassword">Repeat password</Field.Label>
											<Input
												id="newRepeatStaffPassword"
												name="repeatPassword"
												bind:value={newRepeatStaffPassword}
												type="password"
												autocomplete="off"
												placeholder="Match new password"
												onblur={() => (newRepeatStaffPasswordTouched = true)}
												// Set newRepeatStaffPasswordTouched to true when the user leaves the input field.
												aria-invalid={repeatStaffPasswordError}
											/>
											{#if repeatStaffPasswordError}
												<Field.Error>Passwords must match</Field.Error>
											{/if}
										</Field.Field>
										{#if passwordFormError}
											<Field.Error>{passwordFormError}</Field.Error>
										{/if}
										{#if role === 'owner'}
											<Field.Field orientation="horizontal" class="justify-start gap-1">
												<Field.Label for="makeAdmin" class="w-auto flex-none"
													>Make admin?</Field.Label
												>
												<Checkbox id="makeAdmin" name="makeAdmin" bind:checked={makeAdmin} />
											</Field.Field>
										{/if}
										<Button type="submit" class="w-full">Create staff account</Button>
									</Field.Group>
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
