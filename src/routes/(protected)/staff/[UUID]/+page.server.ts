import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const [product] = await db
		.select()
		.from(schema.product)
		.where(eq(schema.product.serialNumber, Number(params.serialNumber)));

	const subcriptions = await db
		.select({ licenseKey: schema.subscription.licenseKey })
		.from(schema.subscription)
		.innerJoin(
			schema.subscriptionToProduct,
			eq(schema.subscription.licenseKey, schema.subscriptionToProduct.licenseKey)
		)
		.where(eq(schema.subscriptionToProduct.serialNumber, Number(params.serialNumber)));

	if (!product) {
		throw error(404, 'The product was not found');
	}

	return { product, subcriptions };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const status = formData.get('status') as 'active' | 'inactive' | 'deactivated';

		await db
			.update(schema.product)
			.set({ status })
			.where(eq(schema.product.serialNumber, Number(params.serialNumber)));

		return { success: true };
	}
};
