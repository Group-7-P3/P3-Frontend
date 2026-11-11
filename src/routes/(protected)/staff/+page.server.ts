import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from '../users/$types';
import { and, eq } from 'drizzle-orm';
import { invalidate } from '$app/navigation';
import { isString, stringCheck } from '#lib/utils.ts';
import { fail } from '@sveltejs/kit';

import 'dotenv';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hashPassword } from 'better-auth/crypto';
import { randomUUID } from 'node:crypto';
import { staff, account } from '$lib/server/db/auth.schema.ts';

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

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.error('❌ DATABASE_URL is not set in your .env file');
	process.exit(1);
}

const client = postgres(connectionString);
const dbd = drizzle(client);

type Role = 'moderator' | 'admin';

export const actions = {
	createStaff: async ({ locals, request }) => {
		const data = await request.formData();

		const email = stringCheck(data.get('newStaffEmail'));
		const name = stringCheck(data.get('newStaffName'));
		const makeAdmin = data.get('makeAdmin');
		let group = 'empty';
		const password = data.get('newStaffPassword');
		const repeatPassword = data.get('repeatPassword');
		let role: Role = 'moderator';

		if (name === null || email === null || makeAdmin === null || group === null) {
			return fail(400, {
				message: 'Please fill in all the fields',
				name,
				email
			});
		}

		if (isString(password) === false || isString(repeatPassword) === false) {
			return fail(400, {
				message: 'Please fill in all the fields'
			});
		}

		if (locals.user?.role === 'owner' && makeAdmin === 'on') {
			role = 'admin';
		}

		if (locals.user?.role === 'owner') {
			group = 'INNOVAID';
		} else {
			group = 'Norway';
		}

		if (password != repeatPassword) {
			throw new Error(`Passwords don't match`);
		}
		createUser(email, name, role, group, password);
	}
} satisfies Actions;

async function createUser(
	email: string,
	name: string,
	role: Role,
	group: string,
	password: string
) {
	try {
		// 1. Check if user already exists and clean up if they do
		const existingUser = await dbd.select().from(staff).where(eq(staff.email, email));
		if (existingUser.length > 0) {
			throw new Error(`User with email ${email} already exists.`);

			const existingId = existingUser[0].id;
			console.log(`User with email ${email} already exists. Cleaning up old record...`);
			await db.delete(account).where(eq(account.userId, existingId));
			await db.delete(staff).where(eq(staff.id, existingId));
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
		invalidate('/staff');
	} catch (error) {
		console.error('❌ Failed to create user:', error);
	}
}
