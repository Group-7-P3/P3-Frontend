<script lang="ts">
	import EmailForm from './email-form.svelte';
	import PasswordForm from './password-form.svelte';
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<div class="flex w-full gap-6">
	<EmailForm/>
	<PasswordForm/>
</div>
