import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { user as userTable, subscription } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const userId = Number(params.id);

	if (isNaN(userId)) {
		throw error(400, 'Invalid user ID');
	}

	const userRows = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);

	if (userRows.length === 0) {
		error(404, 'User not found');
	}

	const userSubscriptions = await db
		.select()
		.from(subscription)
		.where(eq(subscription.userId, userId));

	return {
		user: userRows[0],
		subscriptions: userSubscriptions
	};
};
