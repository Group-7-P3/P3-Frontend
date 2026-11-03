<script lang="ts">
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Button from '#lib/components/ui/button/button.svelte';
	//import { authClient } from '$lib/auth-client';

	let { data }: { data: PageData } = $props();
	const columns = ['id', 'name', 'email', 'createdAt', 'updatedAt', 'role', 'group'];
	let open = $state(false);

	let newStaffEmail = $state('');
	let newStaffPassword = $state('');

	// Check for authority, remember to also do so server side
	//const session = authClient.useSession();

	function handleStaffCreation(e: SubmitEvent) {
		e.preventDefault();
		// REMEMBER TO REMOVE THIS
		console.log(newStaffEmail);
		console.log(newStaffPassword);
		// TODO: Actually change the email
		// Remember to log the creation and who created the staff
	}
</script>

<svelte:head>
	<title>Staff</title>
</svelte:head>

<DataTable
	data={data.staff}
	{columns}
	class="max-w-6xl"
	onRowClick={(staff) => {
		console.log(staff.id);
	}}
	onAddClick={() => {
		open = !open;
	}}
/>

<Dialog bind:open>
	<DialogTrigger></DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle class=".text-2xl"></DialogTitle>
			<DialogDescription></DialogDescription>
		</DialogHeader>
		<Field.Group>
			<form onsubmit={handleStaffCreation}>
				<Field.Set>
					<Field.Legend>Create a new staff member</Field.Legend>
					<Field.Group>
						<Field.Field>
							<Field.Label for="newStaffEmail">New email</Field.Label>
							<Input
								id="newStaffEmail"
								bind:value={newStaffEmail}
								type="email"
								autocomplete="off"
								placeholder="example@example.xyz"
							/>
							<!--
							{#if newEmailError}
								<Field.Error>Please enter a new email</Field.Error>
							{/if}
							-->
						</Field.Field>
						<Field.Field>
							<Field.Label for="newStaffPassword">New password</Field.Label>
							<Input
								id="newStaffPassword"
								bind:value={newStaffPassword}
								type="password"
								autocomplete="off"
								//aria-invalid={emailPasswordError}
							/>
							<!--{#if repeatEmailError}
								<Field.Error>Emails must match</Field.Error>
							{/if}-->
						</Field.Field>
						<Button type="submit" class="w-full">Create</Button>
					</Field.Group>
				</Field.Set>
			</form>
		</Field.Group>
	</DialogContent>
</Dialog>
