import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import type { PageServerLoad } from '../users/$types';
import { error } from '@sveltejs/kit';
import { and, asc, countDistinct, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	const staff = locals.user;
	if (!staff) throw error(401, 'You must be signed in to view products');

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
				ilike(sql`${schema.product.serialNumber}::text`, pattern),
				ilike(sql`${schema.product.status}::text`, pattern),
				ilike(sql`${schema.product.createdAt}::text`, pattern),
				ilike(sql`${schema.product.updatedAt}::text`, pattern),
				ilike(schema.user.managedBy, pattern)
			)
		);
	}
	const where = conditions.length ? and(...conditions) : undefined;
	const sortColumn =
		(
			{
				serialNumber: schema.product.serialNumber,
				status: schema.product.status,
				createdAt: schema.product.createdAt,
				updatedAt: schema.product.updatedAt,
				managedBy: schema.user.managedBy
			} as const
		)[sort as 'serialNumber' | 'status' | 'createdAt' | 'updatedAt' | 'managedBy'] ??
		schema.product.serialNumber;
	const orderBy = direction === 'desc' ? desc(sortColumn) : asc(sortColumn);
	const products = await db
		.selectDistinct({
			...getTableColumns(schema.product),
			managedBy: schema.user.managedBy
		})
		.from(schema.product)
		.innerJoin(
			schema.subscriptionToProduct,
			eq(schema.product.serialNumber, schema.subscriptionToProduct.serialNumber)
		)
		.innerJoin(
			schema.subscription,
			eq(schema.subscriptionToProduct.licenseKey, schema.subscription.licenseKey)
		)
		.innerJoin(schema.user, eq(schema.subscription.userId, schema.user.id))
		.where(where)
		.orderBy(orderBy)
		.limit(pageSize)
		.offset((page - 1) * pageSize);
	const [{ total }] = await db
		.select({ total: countDistinct(schema.product.serialNumber) })
		.from(schema.product)
		.innerJoin(
			schema.subscriptionToProduct,
			eq(schema.product.serialNumber, schema.subscriptionToProduct.serialNumber)
		)
		.innerJoin(
			schema.subscription,
			eq(schema.subscriptionToProduct.licenseKey, schema.subscription.licenseKey)
		)
		.innerJoin(schema.user, eq(schema.subscription.userId, schema.user.id))
		.where(where);

	return {
		products,
		total,
		page,
		pageSize,
		filter,
		sort,
		direction
	};
};
