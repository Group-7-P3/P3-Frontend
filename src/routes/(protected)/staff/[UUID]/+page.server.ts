import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { staff as staffTable } from '$lib/server/db/auth.schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { isString } from '#lib/utils.ts';

export const load: PageServerLoad = async ({ locals, params }) => {
	const staffUser = locals.user;
	// Ensure only valid users can access this page.
	if (!staffUser) throw error(401, 'You must be signed in to view this page');

	// Ensure only authorised users can access this page, through a blacklist.
	if (!staffUser.role || staffUser.role === 'moderator') {
		throw error(403, 'Only owners and admins can access the Staff page');
	}

	const staffId = String(params.UUID);

	// Checks if staff id is valid
	if (!isString(staffId)) {
		throw error(400, 'Invalid user ID');
	}

	// Fetch the user matching the route id
	const staffRows = await db.select().from(staffTable).where(eq(staffTable.id, staffId)).limit(1);

	// Check if staff exists
	if (staffRows.length === 0) {
		error(404, 'Staff not found');
	}

	// Ensure the user accessing the data, has valid permissions to view this users data.
	// Comparing groups
	if (staffUser)
		if (staffUser.group !== 'INNOVAID' && staffRows[0].group !== staffUser.group) {
			throw error(404, 'Staff not found');
		}
	// Comparing authority
	if (
		(staffUser.role === 'admin' && staffRows[0].role === 'owner') ||
		(staffUser.role === 'admin' && staffRows[0].role === 'admin')
	) {
		throw error(404, 'Staff not found');
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
