// scripts/reset-db.ts
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	console.error('❌ DATABASE_URL is not set in environment variables.');
	process.exit(1);
}

const sql = postgres(connectionString);

async function reset() {
	console.log('🗑️ Dropping public schema...');
	await sql`DROP SCHEMA public CASCADE;`;
	await sql`CREATE SCHEMA public;`;
	console.log('✅ Database reset successfully!');
	await sql.end();
}

reset().catch((err) => {
	console.error('❌ Failed to reset database:', err);
	process.exit(1);
});
