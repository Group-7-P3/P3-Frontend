import { createAuthClient } from 'better-auth/svelte';
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import type { auth } from './server/auth';
import { ac, user, moderator, admin, owner } from '../routes/(auth)/permissions';

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields<typeof auth>(),
		adminClient({ ac, roles: { user, owner, admin, moderator } })
	]
});
