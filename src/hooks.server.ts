import type { Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { auth } from '#lib/server/auth.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { redirect } from '@sveltejs/kit';
import { db, demoDb } from './lib/server/db';

const PUBLIC_ROUTES = ['/login'];

const matchesRoute = (path: string, route: string) =>
	path === route || path.startsWith(`${route}/`);

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname.replace(/\/$/, '') || '/';

	const isDemo = matchesRoute(path, '/demo');
	const isLoginRoute = PUBLIC_ROUTES.some((route) => matchesRoute(path, route));
	const isPublicRoute = isLoginRoute || isDemo || path.startsWith('/api/auth');

	event.locals.isDemo = isDemo;
	event.locals.db = isDemo ? demoDb : db;

	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	if (!event.locals.session && !isPublicRoute)
		redirect(303, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);

	if (event.locals.session && isLoginRoute) redirect(303, '/');

	return svelteKitHandler({ event, resolve, auth, building });
};
