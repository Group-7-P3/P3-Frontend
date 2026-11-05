<script lang="ts">
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import type { PageData } from './$types';
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Button from '#lib/components/ui/button/button.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { authClient } from '#lib/client.ts';
	//import { authClient } from '$lib/auth-client';

	// Staff Table, i think
	let { data }: { data: PageData } = $props();
	const columns = ['id', 'name', 'email', 'createdAt', 'updatedAt', 'role', 'group'];

	const session = authClient.useSession();

	const role = $derived($session.data?.user?.role as 'owner' | 'admin' | 'moderator' | undefined);

	const canCreate = $derived(
		role
			? authClient.admin.checkRolePermission({
					role,
					permissions: { staff: ['createModerator'] }
				})
			: false
	);
	// Server side still needs to check for permission

	const canCreateAdmin = $derived(
		role
			? authClient.admin.checkRolePermission({
					role,
					permissions: { staff: ['createAdmin'] }
				})
			: false
	);

	// Opens the dialog for creating a new staff member
	let open = $state(false);

	// Gets input from the form for creating a new staff member
	let newStaffEmail = $state('');
	let newStaffPassword = $state('');
	let giveAdmin = $state(false);

	// Form submission handler for creating a new staff member
	function handleStaffCreation(e: SubmitEvent) {
		e.preventDefault();
		// REMEMBER TO REMOVE THIS
		console.log(newStaffEmail);
		console.log(newStaffPassword);
		console.log(giveAdmin);
		// TODO: Actually change the email
		// Remember to log the creation date/time and who created the staff
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
	/* Add new staff member button, conditional to if user has auth to do so, check for auth */
	onAddClick={canCreate
		? () => {
				open = !open;
			}
		: undefined}
/>

<Dialog bind:open>
	<!--<DialogTrigger></DialogTrigger>
	-->
	<DialogContent class="gap-4">
		<DialogHeader>
			<DialogTitle class="text-center text-2xl">Create a new staff member</DialogTitle>
		</DialogHeader>
		<Field.Group>
			<form onsubmit={handleStaffCreation}>
				<Field.Set>
					<Field.Legend></Field.Legend>
					<Field.Group class="gap-6">
						<Field.Field class="gap-1">
							<Field.Label for="newStaffEmail">New email</Field.Label>
							<Input
								id="newStaffEmail"
								bind:value={newStaffEmail}
								type="email"
								autocomplete="off"
								placeholder="example@example.xyz"
							/>
						</Field.Field>
						<Field.Field class="gap-1">
							<Field.Label for="newStaffPassword">New password</Field.Label>
							<Input
								id="newStaffPassword"
								bind:value={newStaffPassword}
								type="password"
								autocomplete="off"
							/>
							<!--{#if repeatEmailError}
								<Field.Error>Emails must match</Field.Error>
							{/if}-->
						</Field.Field>
						{#if canCreateAdmin}
							<Field.Field orientation="horizontal" class="justify-start gap-1">
								<Field.Label for="makeAdmin" class="w-auto flex-none">Make admin?</Field.Label>
								<Checkbox id="makeAdmin" bind:checked={giveAdmin} />
							</Field.Field>
						{/if}
						<Button type="submit" class="w-full">Create</Button>
					</Field.Group>
				</Field.Set>
			</form>
		</Field.Group>
	</DialogContent>
</Dialog>
