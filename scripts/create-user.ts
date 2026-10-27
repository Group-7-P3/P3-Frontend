// scripts/create-user.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hashPassword } from 'better-auth/crypto';
import { randomUUID } from 'node:crypto';
import { staff, account } from '../src/lib/server/db/auth.schema.ts';
import { eq } from 'drizzle-orm';
import 'dotenv';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.error('❌ DATABASE_URL is not set in your .env file');
	process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function createUser() {
	const args = process.argv.slice(2);

	const email = args[0] || 'admin@local.test';
	const name = args[1] || 'Admin User';
	const role = (args[2] as 'owner' | 'admin' | 'moderator') || 'admin';
	const group = args[3] || 'headquarters';
	const password = args[4] || 'SecurePassword123!';

	if (!['owner', 'admin', 'moderator'].includes(role)) {
		console.error(`❌ Invalid role "${role}". Must be one of: owner, admin, moderator.`);
		process.exit(1);
	}

	console.log(`🔐 Creating staff account for ${email} (${role})...`);

	try {
		// 1. Check if user already exists and clean up if they do
		const existingUser = await db.select().from(staff).where(eq(staff.email, email));
		if (existingUser.length > 0) {
			const existingId = existingUser[0].id;
			console.log(`⚠️ User with email ${email} already exists. Cleaning up old record...`);
			await db.delete(account).where(eq(account.userId, existingId));
			await db.delete(staff).where(eq(staff.id, existingId));
		}

		const hashedPassword = await hashPassword(password);
		const userId = randomUUID();

		// 2. Insert into your custom 'staff' table
		await db.insert(staff).values({
			id: userId,
			name,
			email,
			emailVerified: true,
			role,
			group
		});

		// 3. Insert into the Better Auth 'account' table
		await db.insert(account).values({
			id: randomUUID(),
			userId,
			accountId: userId, // Must match userId for Better Auth credential login
			providerId: 'credential',
			password: hashedPassword,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		console.log('✅ Successfully created user!');
		console.log('-----------------------------------');
		console.log(`Email:    ${email}`);
		console.log(`Password: ${password}`);
		console.log(`Role:     ${role}`);
		console.log(`Group:    ${group}`);
		console.log('-----------------------------------');
	} catch (error) {
		console.error('❌ Failed to create user:', error);
	} finally {
		await client.end();
		process.exit(0);
	}
}

createUser();
