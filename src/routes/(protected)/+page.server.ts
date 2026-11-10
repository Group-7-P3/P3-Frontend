import { db } from '#lib/server/db/index.ts';
import * as schema from '$lib/server/db/schema';
import { count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const activities = await db.select().from(schema.activity);
	const [{ total }] = await db.select({ total: count() }).from(schema.activity);

	return { activities, total };
};
