import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { staff as staffTable } from '$lib/server/db/auth.schema';
import { error, fail, type Actions } from '@sveltejs/kit';
import { and, ne, eq } from 'drizzle-orm';
import { isString } from '#lib/utils.ts';

export const load: PageServerLoad = async ({ params }) => {
	const staffId = String(params.UUID);

	// Checks if staff id is valid
	if (!isString(staffId)) {
		throw error(400, 'Invalid user ID');
	}

	// Fetch the user matching the route id
	const staffRows = await db.select().from(staffTable).where(eq(staffTable.id, staffId)).limit(1);

	if (staffRows.length === 0) {
		error(404, 'Staff not found');
	}
	/*
	// Fetch all subscriptions linked to the user
	const userSubscriptions = await db
		.select()
		.from(subscription)
		.where(eq(subscription.userId, userId));
*/
	return {
		staff: staffRows[0]
	};
};
/*
export const actions: Actions = {
	updateUser: async ({ request, params }) => {
		const data = await request.formData();
		const userId = Number(params.id);
		const rawCustomerId = String(data.get('customerId') ?? '').trim();
		const customerId = Number(rawCustomerId);
		const managedBy = String(data.get('managedBy') ?? '').trim();
		// make sure that customer id is a non-empty valid number
		if (
			!rawCustomerId ||
			!Number.isInteger(customerId) ||
			customerId < -2147483648 ||
			customerId > 2147483647
		) {
			return fail(400, { customerIdInvalid: true });
		}
		// Check is another user (ne means not equal) already exists with this customer id
		const duplicate = await db
			.select({ id: userTable.id })
			.from(userTable)
			.where(and(eq(userTable.customerId, customerId), ne(userTable.id, userId)))
			.limit(1);

		if (duplicate.length > 0) {
			return fail(400, { customerIdDuplicate: true });
		}
		// Save the updated user changes
		await db.update(userTable).set({ customerId, managedBy }).where(eq(userTable.id, userId));

		return { succes: true };
	}
};
*/
