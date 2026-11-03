import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../users/$types';

export const load: PageServerLoad = async ({ locals }) => {
	const isOwner = locals.user?.role === 'owner';
	if (!isOwner) throw error(403, 'Only owners can access the SQL page');
	return {};
};
