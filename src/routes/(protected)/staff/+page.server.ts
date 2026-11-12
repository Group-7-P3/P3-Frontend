import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from '../users/$types';
import { and, eq } from 'drizzle-orm';
import { stringCheck, stringCheckTrim } from '#lib/utils.ts';
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
	throw new Error('DATABASE_URL is not set. Check your .env file.');
}
const client = postgres(connectionString);
const dbd = drizzle(client);

type Role = 'moderator' | 'admin';
const errors: Record<string, string> = {};

export const actions = {
	createStaff: async ({ locals, request }) => {
		if (!locals.user) {
			return fail(401, {
				errors: { general: 'You must be signed in to create a new staff member.' }
			});
		}

		if (locals.user.role !== 'owner' && locals.user.role !== 'admin') {
			return fail(403, {
				errors: { general: 'You do not have permission to create a new staff member.' }
			});
		}
		const data = await request.formData();

		// Extract and validate form data
		const name = stringCheckTrim(data.get('newStaffName'));
		const emailRaw = stringCheckTrim(data.get('newStaffEmail'));
		const email = emailRaw?.toLowerCase() ?? null;
		const makeAdmin = data.get('makeAdmin');
		const group = 'INNOVAID';
		const password = stringCheck(data.get('newStaffPassword'));
		const repeatPassword = stringCheck(data.get('repeatPassword'));
		let role: Role = 'moderator';

		// Name checks
		if (name === null) {
			errors.name = 'Name is required.';
		} else if (name.length < 2) {
			errors.name = 'Name must be at least 2 characters.';
		} else if (name.length > 100) {
			errors.name = 'Name can be at most 100 characters.';
		} else if (!/^[\p{L}\s'.-]+$/u.test(name)) {
			errors.name = 'Name can only contain letters, spaces, apostrophes, dots and dashes.';
		}

		// Email checks
		if (email === null) {
			errors.email = 'Email is required.';
		} else if (email.length > 254) {
			errors.email = 'Email is too long.';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please enter a valid email address.';
		}

		/*
		// Group check
		if (group === 'INNOVAID' && locals.user.group !== 'INNOVAID') {
			errors.group = 'You do not have permission to assign this group.';
		} else if (group === '') {
			errors.group = 'Group is required.';
		} else if (group !== locals.user.group && locals.user.group !== 'INNOVAID') {
			errors.group = 'You do not have permission to assign a group.';
		}*/

		// Password checks, contains same rules as the password rules in the settings page
		if (password === null || repeatPassword === null) {
			errors.password = 'Password and repeat password are required.';
		} else if (password !== repeatPassword) {
			errors.password = 'Passwords do not match.';
		} else if (password.length < 8) {
			errors.password = 'Password must be at least 8 characters long.';
		} else if (password.length > 100) {
			errors.password = 'Password can be at most 100 characters long.';
		} else if (!/[A-Z]/.test(password)) {
			errors.password = 'Password must contain at least one uppercase letter.';
		} else if (!/[a-z]/.test(password)) {
			/*errors.password = 'Password must contain at least one lowercase letter.';
		} */
		} else if (!/[0-9]/.test(password)) {
			errors.password = 'Password must contain at least one number.';
		} else if (!/[^A-Za-z0-9]/.test(password)) {
			errors.password = 'Password must contain at least one special character.';
		}

		if (locals.user.role === 'owner' && makeAdmin === 'on') {
			role = 'admin';
		}

		if (
			Object.keys(errors).length > 0 ||
			name === null ||
			email === null ||
			group === null ||
			password === null
		) {
			return fail(400, { errors });
		}

		try {
			await createUser(email, name, role, group, password);
		} catch (err) {
			console.error('Error creating user:', err);
			return fail(500, { errors });
		}
		return {
			success: true,
			message: `User ${name} created successfully.`
		};
	}
} satisfies Actions;
//qwe
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
			errors.email = 'An user with this email already exists.';
			throw new Error(`User with email ${email} already exists.`);
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
	} catch (err) {
		console.error('Error in createUser function:', err);
		throw err; // Re-throw the error to be caught in the calling function
	}
}
