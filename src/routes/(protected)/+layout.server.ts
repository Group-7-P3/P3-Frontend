import { auth } from '#lib/server/auth.js';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

import { isValidTimeZone } from '#lib/utils/timezones.ts';

const DEFAULT_TIME_ZONE = "Europe/Copenhagen"

export const load: LayoutServerLoad = async ({ locals, request, cookies }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const cookieTZ = cookies.get('timezone');
	const timeZone = cookieTZ && isValidTimeZone(cookieTZ) ? cookieTZ : DEFAULT_TIME_ZONE;

	const cookieFD = cookies.get('firstday');
	const firstDay = cookieFD && (cookieFD === '1' || cookieFD === '0') ? cookieFD : '1';

	return { session, timeZone, firstDay };
};