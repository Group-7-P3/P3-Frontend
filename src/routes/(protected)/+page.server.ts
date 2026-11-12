import { db } from '#lib/server/db/index.ts';
import * as schema from '$lib/server/db/schema';
import { count, sum } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const activities = await db
		.select({
			activity: schema.activity.activity,
			totalUses: count(),
			totalSeconds: sum(schema.activity.seconds)
		})
		.from(schema.activity)
		.groupBy(schema.activity.activity);
	console.log(activities);

	const [{ totalActivities }] = await db.select({ totalActivities: count() }).from(schema.activity);

	return { activities, totalActivities };
};
