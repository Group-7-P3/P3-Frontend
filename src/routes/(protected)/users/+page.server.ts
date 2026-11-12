import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const staff = locals.user;
	if (!staff) throw error(401, 'You must be signed in to view users');

	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const pageSize = Math.max(1, Number(url.searchParams.get('size')) || 12);
	const filter = url.searchParams.get('filter') ?? '';
	const sortParam = url.searchParams.get('sort');
	const sort = sortParam && sortParam !== 'none' ? sortParam : '';
	const direction: 'asc' | 'desc' = url.searchParams.get('direction') === 'desc' ? 'desc' : 'asc';
	const conditions = [];

	if (staff.group !== 'INNOVAID') conditions.push(eq(schema.user.managedBy, staff.group));
	const searchFilter = filter.trim();
	if (searchFilter) {
		const pattern = `%${searchFilter}%`;
		conditions.push(
			or(
				ilike(sql`${schema.user.id}::text`, pattern),
				ilike(sql`${schema.user.customerId}::text`, pattern),
				ilike(schema.user.managedBy, pattern)
			)
		);
	}

	const sortColumn =
		(
			{
				id: schema.user.id,
				customerId: schema.user.customerId,
				managedBy: schema.user.managedBy,
				createdAt: schema.user.createdAt,
				updatedAt: schema.user.updatedAt
			} as const
		)[sort as 'id' | 'customerId' | 'managedBy' | 'createdAt' | 'updatedAt'] ?? schema.user.id;
	const where = conditions.length ? and(...conditions) : undefined;
	const orderBy = direction === 'desc' ? desc(sortColumn) : asc(sortColumn);

	const users = await db
		.select()
		.from(schema.user)
		.where(where)
		.orderBy(orderBy)
		.limit(pageSize)
		.offset((page - 1) * pageSize);
	const [{ total }] = await db.select({ total: count() }).from(schema.user).where(where);

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
