import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const staff = locals.user;
	if (!staff) throw error(401, 'You must be signed in to view users');

	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const pageSize = Math.max(1, Number(url.searchParams.get('size')) || 10);
	const filter = url.searchParams.get('filter') ?? '';
	const sortParam = url.searchParams.get('sort');
	const sort = sortParam && sortParam !== 'none' ? sortParam : '';
	const direction: 'asc' | 'desc' = url.searchParams.get('direction') === 'desc' ? 'desc' : 'asc';
	const usersWithSubs = db
		.select({
			id: schema.user.id,
			managedBy: schema.user.managedBy,
			createdAt: schema.user.createdAt,
			updatedAt: schema.user.updatedAt,
			subscriptions: count(schema.subscription.licenseKey).as('subscriptions')
		})
		.from(schema.user)
		.leftJoin(schema.subscription, eq(schema.subscription.userId, schema.user.id))
		.groupBy(schema.user.id)
		.as('user_with_subs');

	const conditions = [];
	if (staff.group !== 'INNOVAID') conditions.push(eq(schema.user.managedBy, staff.group));

	const searchFilter = filter.trim();
	if (searchFilter) {
		const pattern = `%${searchFilter}%`;
		conditions.push(
			or(ilike(sql`${schema.user.id}::text`, pattern), ilike(schema.user.managedBy, pattern))
		);
	}

	const sortColumn =
		(
			{
				id: usersWithSubs.id,
				managedBy: usersWithSubs.managedBy,
				createdAt: usersWithSubs.createdAt,
				updatedAt: usersWithSubs.updatedAt,
				subscriptions: usersWithSubs.subscriptions
			} as const
		)[sort as 'id' | 'managedBy' | 'createdAt' | 'updatedAt' | 'subscriptions'] ?? usersWithSubs.id;

	const where = conditions.length ? and(...conditions) : undefined;
	const orderBy = direction === 'desc' ? desc(sortColumn) : asc(sortColumn);

	const users = await db
		.select()
		.from(usersWithSubs)
		.where(where)
		.orderBy(orderBy)
		.limit(pageSize)
		.offset((page - 1) * pageSize);
	const [{ total }] = await db.select({ total: count() }).from(usersWithSubs).where(where);

	return {
		users,
		total,
		page,
		pageSize,
		filter,
		sort,
		direction
	};
};
