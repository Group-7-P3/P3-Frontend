<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import * as Field from '$lib/components/ui/field/index.js';

	import { authClient } from '$lib/client.ts';

	import { enhance, type SubmitFunction } from '$app/forms';

	// Gets information on the current session.
	const session = authClient.useSession();

	// Keeps track of whether the form has been submitted.
	let emailSubmitted = $state(false);

	// Keeps track of when form inputs have been touched.
	let newEmailTouched = $state(false);
	let newRepeatEmailTouched = $state(false);
	let emailPasswordTouched = $state(false);

	// Keeps track of the inputs in the form.
	let newEmail = $state('');
	let newRepeatEmail = $state('');
	let emailPassword = $state('');

	// Keeps track of whether the current password has been rejected.
	let emailPasswordRejected = $state(false);

	// Holds the thrown error, if any, after submitting the form.
	let emailError = $state('');

	// Keeps track of which email the user is currently switching to.
	let emailPendingTo = $state('');

	/**
	 * This function returns the normalized version of a string.
	 * It removes the leading and trailing white space and line terminator characters and converts all letters to lowercase.
	 */
	function normalizeEmail(value: string) {
		return value.trim().toLowerCase();
	}

	// Keeps track of the normalized version of the newEmail.
	let normalizedNewEmail = $derived(normalizeEmail(newEmail));

	// Keeps track of whether the new email is the same as the one the user is already using.
	const sameEmailError = $derived(
		normalizedNewEmail === normalizeEmail($session.data?.user.email ?? '')
	);

	// Keeps track of whether the repeated email is correct.
	const emailRepeatOk = $derived(
		normalizedNewEmail !== '' && normalizedNewEmail === normalizeEmail(newRepeatEmail)
	);

	// Keeps track of whether the email form is ok. Like if the password is correct and that the emails are correctly repeated.
	const emailFormOk = $derived(
		emailRepeatOk && emailPassword !== '' && !emailPasswordRejected && !sameEmailError
	);

	// Keeps track of the error status on each input field. Like whether the repeated email is correct or whether the current password is correct.
	const newEmailError = $derived((newEmailTouched || emailSubmitted) && normalizedNewEmail === '');
	const repeatEmailError = $derived((newRepeatEmailTouched || emailSubmitted) && !emailRepeatOk);
	const emailPasswordError = $derived(
		(emailPasswordTouched || emailSubmitted) && (emailPassword === '' || emailPasswordRejected)
	);

	/**
	 * Resets the email form.
	 * Empties the input fields and marks them 'not touched'.
	 */
	function resetEmailForm() {
		newEmail = '';
		newRepeatEmail = '';
		emailPassword = '';
		emailSubmitted = false;

		newEmailTouched = false;
		newRepeatEmailTouched = false;
		emailPasswordTouched = false;
	}

	/**
	 * Runs when the email form is submitted. It validates the form,
	 * then checks the current password on the server. If the password is correct, it requests the email change.
	 * A wrong password or any other error cancels the change,
	 * and displays an appropriate error message below the input field.
	 */
	const handleEmailSubmit: SubmitFunction = ({ cancel }) => {
		emailSubmitted = true;
		if (!emailFormOk) {
			// Cancels the server's check of the password
			cancel();
			return;
		}

		emailPendingTo = '';
		emailError = '';

		// Runs after the server has answered the password check
		return async ({ result }) => {
			if (result.type === 'failure') {
				emailPasswordRejected = true;
				return;
			}
			if (result.type !== 'success') {
				emailError = 'Something went wrong. Please try again';
				return;
			}

			const { error } = await authClient.changeEmail({
				newEmail: normalizedNewEmail
			});

			// If an error occurs, save the message and return;
			if (error) {
				emailError = error?.message ?? '';
				return;
			}

			emailPendingTo = normalizedNewEmail;
			resetEmailForm();
		};
	};
</script>

<Card.Root class="basis-5/12 px-6">
	<form method="POST" action="?/verifyPassword" use:enhance={handleEmailSubmit}>
		<Field.Set>
			<Field.Legend>Change email</Field.Legend>
			<Field.Group>
				<Field.Field>
					<Field.Label for="newEmail">New email</Field.Label>
					<Input
						id="newEmail"
						bind:value={newEmail}
						type="email"
						autocomplete="off"
						placeholder="hello@iaid.com"
						onblur={() => (newEmailTouched = true)}
						// Set newEmailTouched to true when the user leaves the input field.
						oninput={() => (emailError = '')}
						// Set emailError to empty when the user inputs something in the field.
						aria-invalid={!!newEmailError || sameEmailError}
					/>
					{#if newEmailError}
						<Field.Error>Please enter a new email</Field.Error>
					{/if}
					{#if emailError}
						<Field.Error>{emailError}</Field.Error>
					{/if}
					{#if sameEmailError}
						<Field.Error>The new email must be different from your current email</Field.Error>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.Label for="newRepeatEmail">Repeat new email</Field.Label>
					<Input
						id="newRepeatEmail"
						bind:value={newRepeatEmail}
						type="email"
						autocomplete="off"
						placeholder="hello@iaid.com"
						onblur={() => (newRepeatEmailTouched = true)}
						// Set newRepeatEmailTouched to true when the user leaves the input field.
						aria-invalid={repeatEmailError}
					/>
					{#if repeatEmailError}
						<Field.Error>Emails must match</Field.Error>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.Label for="emailPassword">Current password</Field.Label>
					<Input
						id="emailPassword"
						name="password"
						bind:value={emailPassword}
						type="password"
						autocomplete="off"
						onblur={() => (emailPasswordTouched = true)}
						// Set emailPasswordTouched to true when the user leaves the input field.
						oninput={() => (emailPasswordRejected = false)}
						// Set emailPasswordRejected to false when the user inputs something in the field.
						aria-invalid={emailPasswordError}
					/>
					{#if emailPasswordError}
						<Field.Error>
							{emailPassword === '' ? 'Please enter your current password' : 'Invalid password'}
						</Field.Error>
					{/if}
				</Field.Field>
				{#if emailPendingTo !== ''}
					<div class="rounded-md border border-orange-400 p-2 text-orange-400">
						To finalize your email change press the link that has been sent to {emailPendingTo ??
							''}
					</div>
				{/if}
				<Button type="submit" class="w-full">Apply new email</Button>
			</Field.Group>
		</Field.Set>
	</form>
</Card.Root>
