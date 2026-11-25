import type { PageServerLoad } from './$types';
import {
	subscription as subscriptionTable,
	subscriptionToProduct,
	user as userTable
} from '$lib/server/db/schema';
import { error, fail, type Actions } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import * as schema from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, params }) => {
	const licenseKey = Number(params.licenseKey);

	if (isNaN(licenseKey)) {
		throw error(400, 'Invalid license key');
	}

	const subscriptionRows = await locals.db
		.select()
		.from(subscriptionTable)
		.where(eq(subscriptionTable.licenseKey, licenseKey))
		.limit(1);

	if (subscriptionRows.length === 0) {
		error(404, 'Subscription not found');
	}

	const userRows = await locals.db
		.select()
		.from(userTable)
		.where(eq(userTable.id, subscriptionRows[0].userId))
		.limit(1);

	if (userRows.length === 0) {
		error(404, 'User not found');
	}

	const subscriptionProducts = await locals.db
		.select()
		.from(subscriptionToProduct)
		.where(eq(subscriptionToProduct.licenseKey, licenseKey));

	//Query all unique `group` names from the 'staff' table
	const staffGroups = await locals.db
		.selectDistinct({ value: schema.staff.group })
		.from(schema.staff)
		.orderBy(asc(schema.staff.group));

	//Map the `{ value: string }` query rows into a flat `string[]` array
	// and filter out any empty values before passing to the Svelte page.
	const distributors = staffGroups
		.map((row) => row.value)
		.filter((val): val is string => Boolean(val));

	return {
		subscription: subscriptionRows[0],
		products: subscriptionProducts,
		user: userRows[0],
		distributors: distributors
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const licenseKey = Number(params.licenseKey);

		const formData = await request.formData();

		const rawId = String(formData.get('userId') ?? '').trim();
		const newId = Number(rawId);

		if (isNaN(newId) || newId <= 0) {
			return fail(400, { error: 'Please enter a valid User ID' });
		}

		const [existing] = await locals.db
			.select({ id: userTable.id })
			.from(userTable)
			.where(eq(userTable.id, newId));

		if (!existing) {
			return fail(400, { error: 'This User does not exist' });
		}

		await locals.db
			.update(subscriptionTable)
			.set({ userId: newId })
			.where(eq(subscriptionTable.licenseKey, licenseKey));

		return { succes: true };
	}
};
