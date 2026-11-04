<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import * as Field from '$lib/components/ui/field/index.js';

	import { authClient } from '#lib/client.ts';

	const session = authClient.useSession();

	let emailSubmitted = $state(false);

	let newEmailTouched = $state(false);
	let newRepeatEmailTouched = $state(false);
	let emailPasswordTouched = $state(false);

	let newEmail = $state('');
	let newRepeatEmail = $state('');
	let emailPassword = $state('');

	let emailPasswordRejected = $state(false);

	let emailError = $state('');
	let emailPendingTo = $state('');

	function normalizeEmail(value: string) {return value.trim().toLowerCase();}
	let normalizedNewEmail = $derived(normalizeEmail(newEmail));

	const sameEmailError = $derived(normalizedNewEmail === normalizeEmail($session.data?.user.email ?? ''));

	const emailRepeatOk = $derived(normalizedNewEmail !== '' && normalizedNewEmail === normalizeEmail(newRepeatEmail));
	const emailFormOk = $derived(emailRepeatOk && emailPassword !== '' && !emailPasswordRejected && !sameEmailError);

	const newEmailError = $derived((newEmailTouched || emailSubmitted) && normalizedNewEmail === '');
	const repeatEmailError = $derived((newRepeatEmailTouched || emailSubmitted) && !emailRepeatOk);
	const emailPasswordError = $derived((emailPasswordTouched || emailSubmitted) && (emailPassword === '' || emailPasswordRejected));

	function resetEmailForm() {
		newEmail = '';
		newRepeatEmail = '';
		emailPassword = '';
		emailSubmitted = false;

		newEmailTouched = false;
		newRepeatEmailTouched = false;
		emailPasswordTouched = false;
	}

	async function handleEmailSubmit(e: SubmitEvent) {
		e.preventDefault();
		emailSubmitted = true;
		if (!emailFormOk) return;

		emailPendingTo = '';
		emailError = '';

		const sessionEmail = $session.data?.user.email;
		if (!sessionEmail) {
			emailError = "Could not fetch this session's email";
			return;
		}

		const { error: signInError } = await authClient.signIn.email({
			email: sessionEmail,
			password: emailPassword
		});

		if (signInError) {
			if (signInError.code === 'INVALID_EMAIL_OR_PASSWORD') {
				emailPasswordRejected = true;
			} else {
				emailError = signInError.message ?? '';
			}
			return;
		}

		const { error } = await authClient.changeEmail({
			newEmail: normalizedNewEmail
		});

		if (error) {
			emailError = error?.message ?? '';
			return;
		}

		emailPendingTo = normalizedNewEmail;

		resetEmailForm();
	}
</script>

<Card.Root class="basis-5/12 px-6">
    <form onsubmit={handleEmailSubmit}>
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
                        oninput={() => (emailError = '')}
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
                        bind:value={emailPassword}
                        type="password"
                        autocomplete="off"
                        onblur={() => (emailPasswordTouched = true)}
                        oninput={() => (emailPasswordRejected = false)}
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
                        To finalize your email change press the link that has been sent to {$session.data?.user.email ?? ''}
                    </div>
                {/if}
                <Button type="submit" class="w-full">Apply new email</Button>
            </Field.Group>
        </Field.Set>
    </form>
</Card.Root>
