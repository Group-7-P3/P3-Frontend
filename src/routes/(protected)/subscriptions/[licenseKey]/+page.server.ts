import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { subscription as subscriptionTable, subscriptionToProduct, user as userTable } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
    const licenseKey = Number(params.licenseKey);

    if (isNaN(licenseKey)) { throw error(400, 'Invalid license key'); }
    
    const subscriptionRows = await db.select().from(subscriptionTable).where(eq(subscriptionTable.licenseKey, licenseKey)).limit(1);

    if (subscriptionRows.length === 0) {
        error(404, 'Subscription not found');
    }

    const userRows = await db.select().from(userTable).where(eq(userTable.id, subscriptionRows[0].userId)).limit(1);
    
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
}