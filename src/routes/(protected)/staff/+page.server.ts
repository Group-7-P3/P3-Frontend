import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../users/$types';

export const load: PageServerLoad = async ({ locals }) => {
	const isOwner = locals.user?.role === 'owner';
	if (!isOwner) throw error(403, 'Only owners can access the Staff page');

	const staff = await db.select().from(schema.staff);
	return {
		staff
	};
};
