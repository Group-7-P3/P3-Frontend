<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import DataTableDate from '$lib/components/ui/data-table/data-table-date.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { resolve } from '$app/paths';
	import { wordsToTitleCase } from '#lib/utils.ts';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Field from '$lib/components/ui/field/index.js';

	let { data }: { data: PageData } = $props();

	let staff = $derived(data.staff);
	let showAbleStaffUUID = $derived(staff.id.slice(0, 8) + '. . .');
</script>

<svelte:head>
	<title>Staff ({staff.name})</title>
</svelte:head>

<!--
Structure:

Main:
Name
Email
Role
Group
Created at


Edit:
When pressing edit, make it text input fields and make them changeable
Make confirmation dialog, with red button, to show it is destructive.
name,
Email
Role
Group



-->
<div class="w-full space-y-6 text-left">
	<!--Back to Users link-->
	<Button variant="link">
		<a href={resolve('/(protected)/staff')} class="text-sm text-muted-foreground hover:underline">
			&larr; Back to Staff
		</a>
	</Button>

	<div class="container mx-auto space-y-6 p-6">
		<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
			<!-- Staff information -->
			<Card.Root class="md:col-span-1">
				<Card.Header>
					<Card.Title>{staff.name}</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-0">
					<div class="flex items-center justify-between border-b py-2 last:border-0">
						<!-- Email -->
						<dt class="text-sm font-normal text-muted-foreground">Email</dt>
						<dd class="text-sm font-medium text-foreground">
							{staff.email}
						</dd>
					</div>

					<!-- Created at -->
					<div class="flex items-center justify-between border-b py-2 last:border-0">
						<dt class="text-sm font-normal text-muted-foreground">Creation date</dt>
						<dd class="text-sm font-medium text-foreground">
							<DataTableDate value={staff.createdAt} />
						</dd>
					</div>

					<!-- Role -->
					<div class="flex items-center justify-between border-b py-2 last:border-0">
						<dt class="text-sm font-normal text-muted-foreground">Role</dt>
						<dd class="text-sm font-medium text-foreground">
							{staff.role}
						</dd>
					</div>

					<!-- Group -->
					<div class="flex items-center justify-between border-b py-2 last:border-0">
						<dt class="text-sm font-normal text-muted-foreground">Distributor group</dt>
						<dd class="text-sm font-medium text-foreground">
							{staff.group}
						</dd>
					</div>
					<!-- UserID -->
					<div class="flex items-center justify-between border-b py-2 last:border-0">
						<dt class="text-sm font-normal text-muted-foreground">Staff id</dt>
						<Tooltip.Root disableHoverableContent>
							<Tooltip.Trigger
								class="cursor-default text-sm font-medium text-foreground underline decoration-dotted underline-offset-4"
								>{showAbleStaffUUID}
							</Tooltip.Trigger>
							<Tooltip.Content class="pointer-events-none">
								<p>{staff.id}</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Edit Staff Placeholder -->
			<Card.Root class="md:col-span-2">
				<Card.Header>
					<Card.Title>Edit Information</Card.Title>
					<Card.Content class="space-y-2">
						<!-- User ID -->
						<div class="flex items-center justify-between border-b py-2 last:border-0">
							<dt class="text-sm font-normal text-muted-foreground">Change name</dt>
							<dd class="text-sm font-medium text-foreground">
								<Field.Field>
									<Input id="user-Id" type="userID" placeholder="Enter new User ID" />
								</Field.Field>
							</dd>
						</div>
						<!-- User ID -->
						<div class="flex items-center justify-between border-b py-2 last:border-0">
							<dt class="text-sm font-normal text-muted-foreground">Change Email</dt>
							<dd class="text-sm font-medium text-foreground">
								<Field.Field>
									<Input id="user-Id" type="userID" placeholder="Enter new User ID" />
								</Field.Field>
							</dd>
						</div>
						<!-- User ID -->
						<div class="flex items-center justify-between border-b py-2 last:border-0">
							<dt class="text-sm font-normal text-muted-foreground">User ID</dt>
							<dd class="text-sm font-medium text-foreground">
								<Field.Field>
									<Input id="user-Id" type="userID" placeholder="Enter new User ID" />
								</Field.Field>
							</dd>
						</div>
					</Card.Content>
				</Card.Header>
			</Card.Root>

			<!-- Product Placeholder -->
			<Card.Root class="md:col-span-3">
				<Card.Header>
					<Card.Title>What should be shown here?</Card.Title>
				</Card.Header>
			</Card.Root>
		</div>
	</div>
</div>
