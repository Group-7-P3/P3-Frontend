import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from '../users/$types';
import { and, eq } from 'drizzle-orm';

// Temporary

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hashPassword } from 'better-auth/crypto';
import { randomUUID } from 'node:crypto';
import { staff, account } from '$lib/server/db/auth.schema.ts';
import { dataCoords } from 'layerchart';

const client = postgres(connectionString);

const dbd = drizzle(client);

export const load: PageServerLoad = async ({ locals }) => {
	const staffUser = locals.user;
	if (!staffUser) throw error(401, 'You must be signed in to view products');

	if (!staffUser.role || staffUser.role === 'moderator') {
		throw error(403, 'Only owners and admins can access the Staff page');
	}

	const staff = await db
		.select()
		.from(schema.staff)
		.where(
			staffUser.group === 'INNOVAID'
				? undefined
				: and(eq(schema.staff.group, staffUser.group), eq(schema.staff.role, 'moderator'))
		);

	return {
		staff
	};
};

export const actions = {
	createStaff: async ({ request }) => {
		const data = await request.formData();

		const name = getString(data, 'name');
		const newEmail = data.get('newStaffEmail');
		const newName = data.get('newStaffName');
		const role = data.get('makeAdmin');
		const group = 'Innovaid';
		const password = data.get('newStaffPassword');

		createUser(newEmail, newName, role, group, password);
	}
} satisfies Actions;

type Role = 'admin' | 'moderator';
async function createUser(
	email: string,
	name: string,
	role: Role,
	group: string,
	password: string
) {
	if (!connectionString) {
		throw new Error('DATABASE_URL is not set in your .env file');
	}

	if (!['admin', 'moderator'].includes(role)) {
		throw new Error(`Invalid role "${role}". Must be one of: admin, moderator.`);
	}

	console.log(`Creating staff account for ${email} (${role})...`);

	try {
		// 1. Check if user already exists and clean up if they do
		const existingUser = await dbd.select().from(staff).where(eq(staff.email, email));
		if (existingUser.length > 0) {
			throw new Error(`User with email ${email} already exists.`);
			/*
      const existingId = existingUser[0].id;
			console.log(`User with email ${email} already exists. Cleaning up old record...`);
			await db.delete(account).where(eq(account.userId, existingId));
			await db.delete(staff).where(eq(staff.id, existingId));
      */
		}

		const hashedPassword = await hashPassword(password);
		const userId = randomUUID();

		// 2. Insert into your custom 'staff' table
		await dbd.insert(staff).values({
			id: userId,
			name,
			email,
			emailVerified: true,
			role,
			group
		});

		// 3. Insert into the Better Auth 'account' table
		await dbd.insert(account).values({
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
