import { ORIGIN, BETTER_AUTH_SECRET } from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '#lib/server/db/index.ts';
import { ac, moderator, admin, owner } from '../../routes/(auth)/permissions';
import { admin as adminPlugin } from 'better-auth/plugins';

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	plugins: [
		adminPlugin({ ac, roles: { moderator, admin, owner } }),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	],
	user: {
		modelName: 'staff',
		additionalFields: {
			role: {
				type: ['owner', 'admin', 'moderator'],
				required: false,
				defaultValue: 'moderator',
				input: true,
				returned: true
			},
			group: {
				type: 'string',
				input: true,
				returned: true
			}
		}
	}
});
