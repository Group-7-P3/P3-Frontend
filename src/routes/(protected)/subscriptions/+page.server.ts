import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../users/$types';
import { eq, getTableColumns } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) throw error(401, 'You must be signed in to view subscriptions');

	const subscriptions = await db
		.select({
			...getTableColumns(schema.subscription),
			managedBy: schema.user.managedBy
		})
		.from(schema.subscription)
		.innerJoin(schema.user, eq(schema.subscription.userId, schema.user.id))
		.where(user.group === 'INNOVAID' ? undefined : eq(schema.user.managedBy, user.group));

	return {
		subscriptions
	};
};
