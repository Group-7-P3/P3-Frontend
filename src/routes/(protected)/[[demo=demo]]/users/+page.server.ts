import * as schema from '$lib/server/db/schema';
import { and, asc, count, desc, eq, getTableColumns, ilike, or, sql, gte, lte } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { dayBound } from '#lib/utils.ts';

export const load: PageServerLoad = async ({ locals, url }) => {
	const staff = locals.user;
	if (!staff) throw error(401, 'You must be signed in to view users');

	const params = url.searchParams;
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const pageSize = Math.max(1, Number(url.searchParams.get('size')) || 10);
	const filter = url.searchParams.get('filter') ?? '';
	const sortParam = url.searchParams.get('sort');
	const sort = sortParam && sortParam !== 'none' ? sortParam : '';
	const direction: 'asc' | 'desc' = url.searchParams.get('direction') === 'desc' ? 'desc' : 'asc';

	const subscriptionCount = sql<number>`(
		SELECT count(*)::int
		FROM ${schema.subscription}
		WHERE ${schema.subscription.userId} = ${schema.user.id}
	)`;

	const conditions = [];
	if (staff.group !== 'INNOVAID') conditions.push(eq(schema.user.managedBy, staff.group));

	const groups = await locals.db.select().from(schema.group);

	// Text search
	const searchFilter = filter.trim();
	if (searchFilter) {
		const pattern = `%${searchFilter}%`;
		conditions.push(
			or(
				ilike(sql`${schema.user.id}::text`, pattern),
				ilike(schema.user.managedBy, pattern),
				// ilike(sql`${schema.user.createdAt}::text`, pattern),
				// ilike(sql`${schema.user.updatedAt}::text`, pattern),
				ilike(sql`${subscriptionCount}::text`, pattern)
			)
		);
	}

	// Static filters
	const managedByFilter = groups.find((g) => g.name === params.get('managedBy'));
	if (managedByFilter) conditions.push(eq(schema.user.managedBy, managedByFilter.name));

	for (const [column, key] of [
		[schema.user.createdAt, 'createdAt'],
		[schema.user.updatedAt, 'updatedAt']
	] as const) {
		const from = dayBound(params.get(`${key}From`), false);
		const to = dayBound(params.get(`${key}To`), true);
		if (from) conditions.push(gte(column, from));
		if (to) conditions.push(lte(column, to));
	}

	const where = conditions.length ? and(...conditions) : undefined;

	const sortColumn =
		(
			{
				id: schema.user.id,
				managedBy: schema.user.managedBy,
				createdAt: schema.user.createdAt,
				updatedAt: schema.user.updatedAt,
				subscriptions: subscriptionCount
			} as const
		)[sort as 'id' | 'managedBy' | 'createdAt' | 'updatedAt' | 'subscriptions'] ?? schema.user.id;

	const orderBy = direction === 'desc' ? desc(sortColumn) : asc(sortColumn);

	const users = await locals.db
		.select({
			...getTableColumns(schema.user),
			subscriptions: subscriptionCount
		})
		.from(schema.user)
		.where(where)
		.orderBy(orderBy)
		.limit(pageSize)
		.offset((page - 1) * pageSize);
	const [{ total }] = await locals.db.select({ total: count() }).from(schema.user).where(where);

	return {
		users,
		total,
		page,
		pageSize,
		filter,
		sort,
		direction,
		groups
	};
};
