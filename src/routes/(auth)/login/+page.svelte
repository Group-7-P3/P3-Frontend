<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '#lib/client.ts';

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let loading = $state(false);
	let errorMessage = $state('');

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		errorMessage = '';

		await authClient.signIn.email(
			{ email, password, rememberMe },
			{
				onRequest: () => {
					loading = true;
				},
				onSuccess: () => {
					goto(resolve('/(protected)'));
				},
				onError: (ctx: { error: { message: string } }) => {
					errorMessage = ctx.error.message;
					loading = false;
				}
			}
		);
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<Card.Root class="w-full max-w-sm">
	<Card.Header>
		<Card.Title>Login to your account</Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
	</Card.Header>

	<form id="login-form" onsubmit={handleLogin}>
		<Card.Content>
			<Field.Group>
				{#if errorMessage}
					<div
						class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200"
					>
						{errorMessage}
					</div>
				{/if}

				<!-- Email Field -->
				<Field.Field>
					<Field.Label for="email">Email</Field.Label>
					<Input id="email" type="email" bind:value={email} required />
				</Field.Field>

				<!-- Password Field -->
				<Field.Field>
					<Field.Label for="password">Password</Field.Label>
					<Input id="password" type="password" bind:value={password} required />
				</Field.Field>

				<!-- Remember Me -->
				<Field.Field orientation="horizontal">
					<Checkbox id="remember-me" bind:checked={rememberMe} />
					<Field.Label for="remember-me">Remember me</Field.Label>
				</Field.Field>
			</Field.Group>
		</Card.Content>
	</form>

	<Card.Footer class="flex-col gap-2">
		<Button type="submit" form="login-form" class="w-full" disabled={loading}>
			{loading ? 'Logging in...' : 'Login'}
		</Button>
	</Card.Footer>
</Card.Root>
