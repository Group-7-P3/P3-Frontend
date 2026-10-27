// src/routes/(protected)/+layout.server.ts
import { auth } from '#lib/server/auth.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!locals.user) {
		throw redirect(303, '/login');
	}

	return { session };
};
