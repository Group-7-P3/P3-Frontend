import { auth } from '#lib/server/auth.js';
import { redirect } from '@sveltejs/kit';

import { isValidTimeZone, DB_TIME_ZONE } from '#lib/utils/timezone.ts';

export const load = async ({ locals, request, cookies }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const cookieTZ = cookies.get('timezone');
	const timeZone = cookieTZ && isValidTimeZone(cookieTZ) ? cookieTZ : DB_TIME_ZONE;

	const cookieFD = cookies.get('firstday');
	const firstDay = cookieFD && (cookieFD === '1' || cookieFD === '0') ? cookieFD : '1';

	return { session, timeZone, firstDay };
};