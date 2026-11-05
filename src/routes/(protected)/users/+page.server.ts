import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const staff = locals.user;
	if (!staff) throw error(401, 'You must be signed in to view users');

	const users = await db
		.select()
		.from(schema.user)
		.where(staff.group === 'INNOVAID' ? undefined : eq(schema.user.managedBy, staff.group));

	return {
		users
	};
};
