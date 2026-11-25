import type { auth } from '#lib/server/auth.ts';

type AuthSession = typeof auth.$Infer.Session;

declare global {
	namespace App {
		interface Locals {
			session?: AuthSession['session'];
			user?: AuthSession['user'];
			isDemo: boolean;
			db: typeof import('#lib/server/db/index.ts').db;
		}
	}
}

export {};
