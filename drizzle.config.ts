import { defineConfig } from 'drizzle-kit';

const isDemo = process.env.DB_TARGET === 'demo';
const url = isDemo ? process.env.DEMO_DATABASE_URL : process.env.DATABASE_URL;

if (!url) throw new Error(`${isDemo ? 'DEMO_DATABASE_URL' : 'DATABASE_URL'} is not set`);

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url },
	verbose: true,
	strict: true
});
