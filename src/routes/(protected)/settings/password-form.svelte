<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import * as Field from '$lib/components/ui/field/index.js';

	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';

	import { authClient } from '$lib/client.ts';

	// Keeps track of whether the form has been submitted and if the password has changed.
	let passwordSubmitted = $state(false);
	let passwordChanged = $state(false);

	// Holds the thrown error, if any, after submitting the form.
	let passwordFormError = $state('');

	// Keeps track of when form inputs have been touched.
	let newPasswordTouched = $state(false);
	let newRepeatPasswordTouched = $state(false);
	let passwordTouched = $state(false);

	// Keeps track of the inputs in the form.
	let newPassword = $state('');
	let newRepeatPassword = $state('');
	let password = $state('');

	// Keeps track of whether the current password has been rejected.
	let passwordRejected = $state(false);

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
	const lengthOk = $derived(newPassword.length >= 8);
	const groupOk = $derived(groupRules.filter((r) => r.test(newPassword)).length >= 3); // Counts how many subrequirements have been met and returns true if this count is 3 or above.

	// Keeps track of whether the password meets its requirements and whether the repeated password is correct.
	const newPasswordOk = $derived(lengthOk && groupOk);
	const passwordRepeatOk = $derived(newPassword !== '' && newPassword === newRepeatPassword);

	// Keeps track of whether the password form is ok. Like if all requirements are met and that the passwords are correctly repeated.
	const passwordFormOk = $derived(
		newPasswordOk && passwordRepeatOk && password !== '' && !passwordRejected
	);

	// Keeps track of the error status on each input field. Like whether the new password meets the requirements or whether the current password is correct.
	const newPasswordError = $derived((newPasswordTouched || passwordSubmitted) && !newPasswordOk);
	const repeatPasswordError = $derived(
		(newRepeatPasswordTouched || passwordSubmitted) && !passwordRepeatOk
	);
	const passwordError = $derived(
		(passwordTouched || passwordSubmitted) && (password === '' || passwordRejected)
	);

	// Keeps track of whether password rules status should be shown (colors, red/green)
	const showPasswordRulesStatus = $derived(newPassword !== '' || passwordSubmitted);

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
	 * Resets the password form.
	 * Empties the input fields and marks them 'not touched'.
	 */
	function resetPasswordForm() {
		newPassword = '';
		newRepeatPassword = '';
		password = '';
		passwordSubmitted = false;

		newPasswordTouched = false;
		newRepeatPasswordTouched = false;
		passwordTouched = false;
	}

	/**
	 * Validates the password form, and if valid, changes the user's password.
	 * Other sessions are signed out upon password change.
	 * A wrong current password or any other error cancels the change,
	 * and displays an appropriate error message below the input field.
	 * @param e The form's submit event.
	 */
	async function handlePasswordSubmit(e: SubmitEvent) {
		e.preventDefault();
		passwordSubmitted = true;
		if (!passwordFormOk) return;

		passwordChanged = false;
		passwordFormError = '';

		const { error } = await authClient.changePassword({
			newPassword: newPassword,
			currentPassword: password,
			revokeOtherSessions: true
		});

		// If an error occurs, mark the password as rejected or save the error message, then return.
		if (error) {
			if (error.code === 'INVALID_PASSWORD') {
				passwordRejected = true;
			} else {
				passwordFormError = error.message ?? '';
			}
			return;
		}

		// If all succeeds, mark the password as changed and reset the form.
		passwordChanged = true;
		resetPasswordForm();
	}
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

<Card.Root class="basis-7/12 px-6">
	<form onsubmit={handlePasswordSubmit}>
		<Field.Set>
			<Field.Legend>Change password</Field.Legend>
			<div class="flex gap-6">
				<Field.Group class="basis-2/3">
					<Field.Field>
						<Field.Label for="newPassword">New password</Field.Label>
						<Input
							id="newPassword"
							bind:value={newPassword}
							type="password"
							autocomplete="off"
							onblur={() => (newPasswordTouched = true)}
							// Set newPasswordTouched to true when the user leaves the input field.
							aria-invalid={newPasswordError}
						/>
						{#if newPasswordError}
							<Field.Error>The new password must fulfill all requirements</Field.Error>
						{/if}
					</Field.Field>
					<Field.Field>
						<Field.Label for="newRepeatPassword">Repeat new password</Field.Label>
						<Input
							id="newRepeatPassword"
							bind:value={newRepeatPassword}
							type="password"
							autocomplete="off"
							onblur={() => (newRepeatPasswordTouched = true)}
							// Set newRepeatPasswordTouched to true when the user leaves the input field.
							aria-invalid={repeatPasswordError}
						/>
						{#if repeatPasswordError}
							<Field.Error>Passwords must match</Field.Error>
						{/if}
					</Field.Field>
					<Field.Field>
						<Field.Label for="password">Current password</Field.Label>
						<Input
							id="password"
							bind:value={password}
							type="password"
							autocomplete="off"
							onblur={() => (passwordTouched = true)}
							// Set passwordTouched to true when the user leaves the input field.
							oninput={() => {
								passwordRejected = false;
								passwordFormError = '';
							}}
							// Set passwordRejected to false and passwordFormError to empty when the user inputs something in the field.
							aria-invalid={passwordError}
						/>
						{#if passwordError}
							<Field.Error>
								{password === '' ? 'Please enter your current password' : 'Invalid password'}
							</Field.Error>
						{/if}
					</Field.Field>
					{#if passwordChanged}
						<div class="rounded-md border border-green-600 p-2 text-green-600">
							Your password has been changed
						</div>
					{/if}
					{#if passwordFormError}
						<Field.Error>{passwordFormError}</Field.Error>
					{/if}
					<Button type="submit" class="w-full">Apply new password</Button>
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
										{@const passed = rule.test(newPassword)}
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
</Card.Root>
