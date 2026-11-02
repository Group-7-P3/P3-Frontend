import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import type { PageServerLoad } from '../users/$types';

export const load: PageServerLoad = async () => {
	const products = await db.select().from(schema.product);

	return {
		products
	};
};
