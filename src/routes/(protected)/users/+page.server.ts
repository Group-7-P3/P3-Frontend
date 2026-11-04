import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) throw error(401, 'You must be signed in to view users');

	const users = await db
		.select()
		.from(schema.user)
		.where(user.group === 'INNOVAID' ? undefined : eq(schema.user.managedBy, user.group));

	return {
		users
	};
};
