import * as schema from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const [product] = await locals.db
		.select()
		.from(schema.product)
		.where(eq(schema.product.serialNumber, Number(params.serialNumber)));

	const subscriptions = await locals.db
		.select({
			licenseKey: schema.subscription.licenseKey,
			type: schema.subscription.type
		})
		.from(schema.subscription)
		.innerJoin(
			schema.subscriptionToProduct,
			eq(schema.subscription.licenseKey, schema.subscriptionToProduct.licenseKey)
		)
		.where(eq(schema.subscriptionToProduct.serialNumber, Number(params.serialNumber)));

	if (!product) {
		throw error(404, 'The product was not found');
	}

	return { product, subscriptions };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const status = formData.get('status') as 'active' | 'inactive' | 'deactivated';
		const targetScope = formData.get('targetScope') as string;
		const newLicenseKey = formData.get('newLicenseKey') as string | null;

		await locals.db
			.update(schema.product)
			.set({ status })
			.where(eq(schema.product.serialNumber, Number(params.serialNumber)));

		if (targetScope && targetScope !== 'all' && newLicenseKey && newLicenseKey !== targetScope) {
			await locals.db
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
