import type { Session } from 'better-auth';
import type { auth } from '$lib/server/auth';

type AuthUser = typeof auth.$Infer.Session.user;

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: AuthUser;
			session?: Session;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
