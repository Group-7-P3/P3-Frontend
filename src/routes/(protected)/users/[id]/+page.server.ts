import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import * as schema from '$lib/server/db/schema';
import { user as userTable, subscription } from '$lib/server/db/schema';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const userId = Number(params.id);

	if (isNaN(userId)) {
		throw error(400, 'Invalid user ID');
	}
	// Fetch the user matching the route id
	const [user] = await db.select().from(userTable).where(eq(userTable.id, userId));

	if (!user) {
		error(404, 'User not found');
	}
	// Fetch all subscriptions linked to the user
	const subscriptions = await db.select().from(subscription).where(eq(subscription.userId, userId));

	//Query all unique `group` names from the 'staff' table
	const staffGroups = await db
		.selectDistinct({ value: schema.staff.group })
		.from(schema.staff)
		.orderBy(asc(schema.staff.group));

	//Map the `{ value: string }` query rows into a flat `string[]` array
	// and filter out any empty values before passing to the Svelte page.
	const distributors = staffGroups
		.map((row) => row.value)
		.filter((val): val is string => Boolean(val));

	return {
		user,
		subscriptions,
		distributors
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const currentId = Number(params.id);
		const formData = await request.formData();

		const rawId = String(formData.get('userId') ?? '').trim();
		const managedBy = String(formData.get('managedBy') ?? '').trim();
		const newId = rawId === '' ? currentId : Number(rawId);

		if (isNaN(newId) || newId <= 0) {
			return fail(400, { error: 'Please enter a valid User ID' });
		}

		if (newId !== currentId) {
			const [existing] = await db
				.select({ id: userTable.id })
				.from(userTable)
				.where(eq(userTable.id, newId));
			if (existing) {
				return fail(400, { error: 'This User ID is already in use' });
			}

			await db.transaction(async (tx) => {
				await tx.update(userTable).set({ id: newId, managedBy }).where(eq(userTable.id, currentId));
				await tx
					.update(subscription)
					.set({ userId: newId })
					.where(eq(subscription.userId, currentId));
			});

			redirect(303, `/users/${newId}`);
		}
		await db.update(userTable).set({ managedBy }).where(eq(userTable.id, currentId));
		return { succes: true };
	}
};
