<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import * as Field from '$lib/components/ui/field/index.js';

	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';

	/*-------------------- Email --------------------*/
	let emailSubmitted = $state(false);

	let newEmailTouched = $state(false);
	let newRepeatEmailTouched = $state(false);
	let emailPasswordTouched = $state(false);

	let newEmail = $state('');
	let newRepeatEmail = $state('');
	let emailPassword = $state('');

	const validEmailPassword = $derived(emailPassword !== '123456'); // PLACEHOLDER
	const emailRepeatOk = $derived(newEmail !== '' && newEmail === newRepeatEmail);
	const emailFormOk = $derived(emailRepeatOk && emailPassword !== '' && validEmailPassword);

	const newEmailError = $derived((newEmailTouched || emailSubmitted) && newEmail === '');
	const repeatEmailError = $derived((newRepeatEmailTouched || emailSubmitted) && !emailRepeatOk);
	const emailPasswordError = $derived((emailPasswordTouched || emailSubmitted) && (emailPassword === '' || !validEmailPassword));

	function handleEmailSubmit(e: SubmitEvent) {
		e.preventDefault();
		emailSubmitted = true;
		if (!emailFormOk) return;
		// TODO: Actually change the email
	}

	/*-------------------- Password --------------------*/
	let passwordSubmitted = $state(false);

	let newPasswordTouched = $state(false);
	let newRepeatPasswordTouched = $state(false);
	let passwordTouched = $state(false);

	let newPassword = $state('');
	let newRepeatPassword = $state('');
	let password = $state('');

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

	const lengthOk = $derived(newPassword.length >= 8);
	const groupOk = $derived(groupRules.filter((r) => r.test(newPassword)).length >= 3);
	const newPasswordOk = $derived(lengthOk && groupOk);
	const passwordRepeatOk = $derived(newPassword !== '' && newPassword === newRepeatPassword);
	const validPassword = $derived(password !== '123456'); // PLACEHOLDER
	const passwordFormOk = $derived(newPasswordOk && passwordRepeatOk && password !== '' && validPassword);

	const newPasswordError = $derived((newPasswordTouched || passwordSubmitted) && !newPasswordOk);
	const repeatPasswordError = $derived((newRepeatPasswordTouched || passwordSubmitted) && !passwordRepeatOk);
	const passwordError = $derived((passwordTouched || passwordSubmitted) && (password === '' || !validPassword));

	const showPasswordRules = $derived(newPassword !== '' || passwordSubmitted);

	function ruleClass(passed: boolean, optional = false) {
		if (!showPasswordRules) return '';
		if (passed) return 'text-green-600';
		if (optional && groupOk) return 'line-through text-muted-foreground';
		return 'text-red-600';
	}

	function handlePasswordSubmit(e: SubmitEvent) {
		e.preventDefault();
		passwordSubmitted = true;
		if (!passwordFormOk) return;
		// TODO: Actually change the password
	}
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

{#snippet bullet(ok: boolean)}
	{#if ok}
		<CheckIcon class="size-4" />
	{:else}
		<XIcon class="size-4" />
	{/if}
{/snippet}

<div class="flex w-full gap-6">
<!-- -------------------- Email -------------------- -->
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
							placeholder="m@example.com"
							onblur={() => (newEmailTouched = true)}
							aria-invalid={newEmailError}
						/>
						{#if newEmailError}
							<Field.Error>Please enter a new email</Field.Error>
						{/if}
					</Field.Field>
					<Field.Field>
						<Field.Label for="newRepeatEmail">Repeat new email</Field.Label>
						<Input
							id="newRepeatEmail"
							bind:value={newRepeatEmail}
							type="email"
							autocomplete="off"
							placeholder="m@example.com"
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
							aria-invalid={emailPasswordError}
						/>
						{#if emailPasswordError}
							<Field.Error>
								{emailPassword === '' ? 'Please enter your current password' : 'Invalid password'}
							</Field.Error>
						{/if}
					</Field.Field>
					<Button type="submit" class="w-full">Apply new email</Button>
				</Field.Group>
			</Field.Set>
		</form>
	</Card.Root>

<!-- -------------------- Password -------------------- -->
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
								aria-invalid={newPasswordError}
							/>
							{#if newPasswordError}
								<Field.Error>Please enter a new password</Field.Error>
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
								aria-invalid={passwordError}
							/>
							{#if passwordError}
								<Field.Error>
									{password === '' ? 'Please enter your current password' : 'Invalid password'}
								</Field.Error>
							{/if}
						</Field.Field>
						<Button type="submit" class="w-full">Apply new password</Button>
					</Field.Group>
					<Field.Group class="basis-1/3">
						<div>
							<h3 class="mb-2 font-semibold">Password requirements</h3>
							<ul class="space-y-2 text-muted-foreground">
								<li class={['flex items-center gap-2', ruleClass(lengthOk)]}>
									{@render bullet(lengthOk)}
									At least 8 characters long
								</li>
								<li class={ruleClass(groupOk)}>
									<div class="flex items-center gap-2">
										{@render bullet(groupOk)}
										At least 3 of the following:
									</div>
									<ul class="mt-1.5 space-y-1 pl-6">
										{#each groupRules as rule (rule.id)}
											{@const passed = rule.test(newPassword)}
											<li class={['flex items-center gap-2', ruleClass(passed, true)]}>
												{@render bullet(passed)}
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
</div>
