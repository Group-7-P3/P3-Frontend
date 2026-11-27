import * as schema from '#lib/server/db/schema.ts';
import { error } from '@sveltejs/kit';
import {
	eq,
	or,
	ilike,
	sql,
	and,
	desc,
	asc,
	gte,
	lte,
	getTableColumns,
	countDistinct
} from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { dayBound } from '#lib/utils.ts';

export const load: PageServerLoad = async ({ locals, url }) => {
	const staff = locals.user;
	if (!locals.isDemo && !staff) error(401, 'You must be signed in to view products');

	const params = url.searchParams;
	const page = Math.max(1, Number(params.get('page')) || 1);
	const pageSize = Math.max(1, Number(params.get('size')) || 10);
	const filter = params.get('filter') ?? '';
	const sortParam = params.get('sort');
	const sort = sortParam && sortParam !== 'none' ? sortParam : '';
	const direction: 'asc' | 'desc' = params.get('direction') === 'desc' ? 'desc' : 'asc';

	const conditions = [];

	const groups = await locals.db.select().from(schema.group);
	const productTypes = await locals.db.select().from(schema.productType);

	// Group scoping applies to real staff only; the public demo shows everything
	if (!locals.isDemo && staff && staff.group !== 'INNOVAID')
		conditions.push(eq(schema.user.managedBy, staff.group));

	// Text search
	const searchFilter = filter.trim();
	if (searchFilter) {
		const pattern = `%${searchFilter}%`;
		conditions.push(
			or(
				ilike(sql`${schema.product.serialNumber}::text`, pattern),
				ilike(sql`${schema.product.status}::text`, pattern),
				ilike(schema.productType.type, pattern),
				ilike(schema.user.managedBy, pattern)
			)
		);
	}

	// Static filters
	const status = schema.product.status.enumValues.find((s) => s === params.get('status'));
	if (status) conditions.push(eq(schema.product.status, status));

	const managedBy = groups.find((g) => g.name === params.get('managedBy'));
	if (managedBy) conditions.push(eq(schema.user.managedBy, managedBy.name));

	const productType = productTypes.find((pt) => pt.type === params.get('type'));
	if (productType) conditions.push(eq(schema.productType.type, productType.type));

	for (const [column, key] of [
		[schema.product.createdAt, 'createdAt'],
		[schema.product.updatedAt, 'updatedAt']
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
				serialNumber: schema.product.serialNumber,
				status: schema.product.status,
				type: schema.productType.type,
				createdAt: schema.product.createdAt,
				updatedAt: schema.product.updatedAt,
				managedBy: schema.user.managedBy
			} as const
		)[sort as 'serialNumber' | 'status' | 'type' | 'createdAt' | 'updatedAt' | 'managedBy'] ??
		schema.product.serialNumber;

	const orderBy = direction === 'desc' ? desc(sortColumn) : asc(sortColumn);

	const productTypeJoin = eq(
		sql`(${schema.product.serialNumber} / 1000) % 100`,
		schema.productType.id
	);

	const [products, [{ total }]] = await Promise.all([
		locals.db
			.selectDistinct({
				...getTableColumns(schema.product),
				managedBy: schema.user.managedBy,
				type: schema.productType.type
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
			.leftJoin(schema.productType, productTypeJoin) // Changed to leftJoin
			.where(where)
			.orderBy(orderBy)
			.limit(pageSize)
			.offset((page - 1) * pageSize),
		locals.db
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
			.leftJoin(schema.productType, productTypeJoin) // Keep joins identical
			.where(where)
	]);

	return {
		products,
		total,
		page,
		pageSize,
		filter,
		sort,
		direction,
		groups,
		productTypes
	};
};
