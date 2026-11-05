import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../users/$types';
import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';

const pageSize = 12;

export const load: PageServerLoad = async ({ locals, url }) => {
	const staffUser = locals.user;
	if (!staffUser) throw error(401, 'You must be signed in to view products');

	if (!staffUser.role || staffUser.role === 'moderator') {
		throw error(403, 'Only owners and admins can access the Staff page');
	}

	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const filter = url.searchParams.get('filter')?.trim() ?? '';
	const sortParam = url.searchParams.get('sort');
	const sort = sortParam && sortParam !== 'none' ? sortParam : '';
	const direction: 'asc' | 'desc' = url.searchParams.get('direction') === 'desc' ? 'desc' : 'asc';
	const conditions = [];
	if (staffUser.group !== 'INNOVAID') {
		conditions.push(eq(schema.staff.group, staffUser.group), eq(schema.staff.role, 'moderator'));
	}
	if (filter) {
		const pattern = `%${filter}%`;
		conditions.push(
			or(
				ilike(schema.staff.id, pattern),
				ilike(schema.staff.name, pattern),
				ilike(schema.staff.email, pattern),
				ilike(sql`${schema.staff.createdAt}::text`, pattern),
				ilike(sql`${schema.staff.updatedAt}::text`, pattern),
				ilike(schema.staff.role, pattern),
				ilike(schema.staff.group, pattern)
			)
		);
	}
	const where = conditions.length ? and(...conditions) : undefined;
	const sortColumn =
		(
			{
				id: schema.staff.id,
				name: schema.staff.name,
				email: schema.staff.email,
				createdAt: schema.staff.createdAt,
				updatedAt: schema.staff.updatedAt,
				role: schema.staff.role,
				group: schema.staff.group
			} as const
		)[sort as 'id' | 'name' | 'email' | 'createdAt' | 'updatedAt' | 'role' | 'group'] ??
		schema.staff.id;
	const orderBy = direction === 'desc' ? desc(sortColumn) : asc(sortColumn);
	const staff = await db
		.select()
		.from(schema.staff)
		.where(where)
		.orderBy(orderBy)
		.limit(pageSize)
		.offset((page - 1) * pageSize);
	const [{ total }] = await db.select({ total: count() }).from(schema.staff).where(where);

	return {
		staff,
		total,
		page,
		pageSize,
		filter,
		sort,
		direction
	};
};
