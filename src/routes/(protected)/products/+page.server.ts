import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../users/$types';
import { eq, getTableColumns } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const staff = locals.user;
	if (!staff) throw error(401, 'You must be signed in to view products');

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
		.where(staff.group === 'INNOVAID' ? undefined : eq(schema.user.managedBy, staff.group));

	return {
		products
	};
};
