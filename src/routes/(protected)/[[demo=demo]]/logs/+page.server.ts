import * as schema from '$lib/server/db/schema';
import { and, asc, count, desc, eq, getTableColumns, ilike, or, sql, gte, lte } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { dayBound } from '#lib/utils.ts';
import { logTypes, severities } from '#lib/types.ts';

export const load: PageServerLoad = async ({ locals, url }) => {
	const staff = locals.user;
	if (!staff) throw error(401, 'You must be signed in to view logs');

	const params = url.searchParams;
	const page = Math.max(1, Number(params.get('page')) || 1);
	const pageSize = Math.max(1, Number(params.get('size')) || 10);
	const filter = params.get('filter') ?? '';
	const sortParam = params.get('sort');
	const sort = sortParam && sortParam !== 'none' ? sortParam : '';

	// Newest first by default; otherwise follow the requested direction
	const direction: 'asc' | 'desc' = sort
		? params.get('direction') === 'desc'
			? 'desc'
			: 'asc'
		: 'desc';

	const conditions = [];
	if (staff.group !== 'INNOVAID') conditions.push(eq(schema.log.group, staff.group));

	const groups = await locals.db.select().from(schema.group);

	// Text search
	const searchFilter = filter.trim();
	if (searchFilter) {
		const pattern = `%${searchFilter}%`;
		conditions.push(
			or(
				ilike(sql`${schema.log.id}::text`, pattern),
				ilike(sql`${schema.log.by}::text`, pattern),
				ilike(sql`${schema.log.group}::text`, pattern),
				ilike(sql`${schema.log.severity}::text`, pattern),
				ilike(sql`${schema.log.type}::text`, pattern)
			)
		);
	}

	// Static filters
	const groupFilter = groups.find((g) => g.name === params.get('group'));
	if (groupFilter) conditions.push(eq(schema.log.group, groupFilter.name));

	const severityFilter = severities.find((s) => s === params.get('severity'));
	if (severityFilter) conditions.push(eq(schema.log.severity, severityFilter));

	const typeFilter = logTypes.find((t) => t === params.get('type'));
	if (typeFilter) conditions.push(eq(schema.log.type, typeFilter));

	const byFilter = params.get('by')?.trim();
	if (byFilter) conditions.push(ilike(sql`${schema.log.by}::text`, `%${byFilter}%`));

	const from = dayBound(params.get('createdAtFrom'), false);
	const to = dayBound(params.get('createdAtTo'), true);
	if (from) conditions.push(gte(schema.log.createdAt, from));
	if (to) conditions.push(lte(schema.log.createdAt, to));

	const where = conditions.length ? and(...conditions) : undefined;

	const sortColumn =
		(
			{
				id: schema.log.id,
				by: schema.log.by,
				group: schema.log.group,
				severity: schema.log.severity,
				type: schema.log.type,
				createdAt: schema.log.createdAt
			} as const
		)[sort as 'id' | 'by' | 'group' | 'severity' | 'type' | 'createdAt'] ?? schema.log.createdAt;

	const orderBy = direction === 'desc' ? desc(sortColumn) : asc(sortColumn);

	const logs = await locals.db
		.select(getTableColumns(schema.log))
		.from(schema.log)
		.where(where)
		.orderBy(orderBy, desc(schema.log.id)) // stable tiebreaker so pagination doesn't shuffle rows
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	const [{ total }] = await locals.db.select({ total: count() }).from(schema.log).where(where);

	return {
		logs,
		total,
		page,
		pageSize,
		filter,
		sort,
		direction,
		groups,
		severities,
		logTypes
	};
};
