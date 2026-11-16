import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../users/$types';
import { and, asc, count, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	const staff = locals.user;
	if (!staff) throw error(401, 'You must be signed in to view subscriptions');

	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const pageSize = Math.max(1, Number(url.searchParams.get('size')) || 10);
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
				ilike(sql`${schema.subscription.licenseKey}::text`, pattern),
				ilike(sql`${schema.subscription.userId}::text`, pattern),
				ilike(sql`${schema.subscription.type}::text`, pattern),
				ilike(sql`${schema.subscription.maxDevices}::text`, pattern),
				ilike(sql`${schema.subscription.createdAt}::text`, pattern),
				ilike(sql`${schema.subscription.updatedAt}::text`, pattern),
				ilike(sql`${schema.subscription.expiresAt}::text`, pattern),
				ilike(sql`${schema.subscription.autoRenew}::text`, pattern),
				ilike(schema.user.managedBy, pattern)
			)
		);
	}

	const where = conditions.length ? and(...conditions) : undefined;

	const sortColumn =
		(
			{
				licenseKey: schema.subscription.licenseKey,
				userId: schema.subscription.userId,
				type: schema.subscription.type,
				maxDevices: schema.subscription.maxDevices,
				createdAt: schema.subscription.createdAt,
				updatedAt: schema.subscription.updatedAt,
				expiresAt: schema.subscription.expiresAt,
				autoRenew: schema.subscription.autoRenew,
				managedBy: schema.user.managedBy
			} as const
		)[
			sort as
				| 'licenseKey'
				| 'userId'
				| 'type'
				| 'maxDevices'
				| 'createdAt'
				| 'updatedAt'
				| 'expiresAt'
				| 'autoRenew'
				| 'managedBy'
		] ?? schema.subscription.licenseKey;

	const orderBy = direction === 'desc' ? desc(sortColumn) : asc(sortColumn);

	const subscriptions = await db
		.select({
			...getTableColumns(schema.subscription),
			devices: sql<number>`(
        SELECT count(*)::int 
        FROM ${schema.subscriptionToProduct} 
        WHERE ${schema.subscriptionToProduct.licenseKey} = ${schema.subscription.licenseKey}
      )`,
			managedBy: schema.user.managedBy
		})
		.from(schema.subscription)
		.innerJoin(schema.user, eq(schema.subscription.userId, schema.user.id))
		.where(where)
		.orderBy(orderBy)
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	const [{ total }] = await db
		.select({ total: count() })
		.from(schema.subscription)
		.innerJoin(schema.user, eq(schema.subscription.userId, schema.user.id))
		.where(where);

	return {
		subscriptions,
		total,
		page,
		pageSize,
		filter,
		sort,
		direction
	};
};
