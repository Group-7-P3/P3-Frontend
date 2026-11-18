import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import {
	subscription as subscriptionTable,
	subscriptionToProduct,
	user as userTable
} from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	const licenseKey = Number(params.licenseKey);

	if (isNaN(licenseKey)) {
		throw error(400, 'Invalid license key');
	}

	const subscriptionRows = await db
		.select()
		.from(subscriptionTable)
		.where(eq(subscriptionTable.licenseKey, licenseKey))
		.limit(1);

	if (subscriptionRows.length === 0) {
		error(404, 'Subscription not found');
	}

	const userRows = await db
		.select()
		.from(userTable)
		.where(eq(userTable.id, subscriptionRows[0].userId))
		.limit(1);

	if (userRows.length === 0) {
		error(404, 'User not found');
	}

	const subscriptionProducts = await db
		.select()
		.from(subscriptionToProduct)
		.where(eq(subscriptionToProduct.licenseKey, licenseKey));

	return {
		subscription: subscriptionRows[0],
		products: subscriptionProducts,
		user: userRows[0]
	};
};

/*
export const actions: Actions = {
	default: async ({ request, params }) => {


		const formData = await request.formData();
		const status = formData.get('status') as 'active' | 'inactive' | 'deactivated';
		const targetScope = formData.get('targetScope') as string;
		const newLicenseKey = formData.get('newLicenseKey') as string | null;

		
		await db
			.update(schema.product)
			.set({ status })
			.where(eq(schema.product.serialNumber, Number(params.serialNumber)));

		if (targetScope && targetScope !== 'all' && newLicenseKey && newLicenseKey !== targetScope) {
			await db
				.update(schema.subscriptionToProduct)
				.set({ licenseKey: Number(newLicenseKey) })
				.where(
					and(
						eq(schema.subscriptionToProduct.serialNumber, Number(params.serialNumber)),
						eq(schema.subscriptionToProduct.licenseKey, Number(targetScope))
					)
				);
		}

		return { success: true };
	}
};
*/