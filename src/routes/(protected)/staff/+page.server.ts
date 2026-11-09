import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../users/$types';
import { and, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  const staffUser = locals.user;
	if (!staffUser) throw error(401, 'You must be signed in to view products');

	if (!staffUser.role || staffUser.role === 'moderator') {
		throw error(403, 'Only owners and admins can access the Staff page');
	}

	const staff = await db
    .select()
    .from(schema.staff)
    .where(
      staffUser.group === "INNOVAID" 
        ? undefined 
        : and(
          eq(schema.staff.group, staffUser.group), 
          eq(schema.staff.role, "moderator")
        )
      );

	return {
		staff
	};
};
