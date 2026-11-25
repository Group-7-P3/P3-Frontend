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
	if (!staffUser.role || staffUser.role === 'supporter') {
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

	return {
		staff: staffRows[0]
	};
};
