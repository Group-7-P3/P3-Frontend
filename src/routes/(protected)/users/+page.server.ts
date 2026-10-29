import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const users = await db.select().from(schema.user);

	return {
		users
	};
};
