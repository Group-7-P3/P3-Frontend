import type { Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { auth } from '#lib/server/auth.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { redirect } from '@sveltejs/kit';

const PUBLIC_ROUTES = ['/login'];

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname.replace(/\/$/, '') || '/';

	const isPublicRoute =
		PUBLIC_ROUTES.some((route) => path === route || path.startsWith(`${route}/`)) ||
		path.startsWith('/api/auth');

	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	if (!event.locals.session && !isPublicRoute)
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);

	if (
		event.locals.session &&
		PUBLIC_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
	)
		throw redirect(303, '/');

	return svelteKitHandler({ event, resolve, auth, building });
};
