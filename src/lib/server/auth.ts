import { ORIGIN, BETTER_AUTH_SECRET } from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '#lib/server/db/index.ts';
import { sendMail } from './email/sender.ts';
import { createAuthMiddleware, APIError } from 'better-auth/api';

import { and, eq } from 'drizzle-orm';
import { staff } from '#lib/server/db/auth.schema.ts';

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	],
	user: {
		modelName: 'staff',
		changeEmail: {
			enabled: true,
			updateEmailWithoutVerification: false,
		},
		additionalFields: {
			role: {
				type: ['owner', 'admin', 'moderator'],
				required: false,
				defaultValue: 'moderator',
				input: false,
				returned: true
			},
			group: {
				type: 'string',
				input: true,
				returned: true
			}
		}
	},
	emailVerification: {
		expiresIn: 60 * 15, // 15 minutes
		sendVerificationEmail: async ({user, url}) => {
			sendMail({
				to: user.email,
				subject: "Verify email",
				text: '<p>Click below to verify your email change:</p>' +
				`<p><a href="${url}">Verify email change</a></p>` +
				'<p>The link is active for 15 minutes.</p>'
			});
		}
	},
	// hooks happen before/after an event happens, in this case betterAuth events.
	hooks: {
		// This runs before each betterAuth event
		before: createAuthMiddleware(async (ctx) => {
			// Return if the event is not an email change
			if (ctx.path !== '/change-email') {
				return;
			} else {
				// Fetch all staff emails which are equal to the email we are trying to use
				const email = (await db
				.select({ email: staff.email})
				.from(staff)
				.where(eq(staff.email, ctx.body.newEmail)));

				// If any emails are found, throw an error
				if (email[0]) {
					throw new APIError('BAD_REQUEST', { message: "This email is already in use."});
				}
			}
		}),
		// This runs after each betterAuth event
		after: createAuthMiddleware(async (ctx) => {
			// Return if the event is not an email change or a password change
			if ((ctx.path !== '/change-email') && (ctx.path !== '/change-password')) return;

			let whatChanged; // email or password
			let newEmail;

			// If the event is a change email event
			if (ctx.path === '/change-email') {
				whatChanged = "email";
				newEmail = ctx.body.newEmail; // Get the new email
			}

			// If the event is a change password event
			if (ctx.path === '/change-password') whatChanged = "password";
			
			const currentEmail = ctx.context.session?.user.email; // Get the current email
			const group = ctx.context.session?.user.group; // Get the group of the staff (INNOVAID/Norway/Italy etc.)

			if (!currentEmail) return;

			if (whatChanged === "email" && !newEmail) return;

			// Send mail to current email
			sendMail({
				to: currentEmail,
				subject: ("Notice of " + whatChanged + " change"),
				text: '<p>Hello,</p>' +
					`<p>A request to change the ${whatChanged} on your staff account has been made.` +
					`${whatChanged === 'email' ? `<br>New email: ${newEmail}` : ''}</p>` +
					`<p>If you did not make this ${whatChanged} change, contact your manager immediately.</p>`
			});

			let bossEmail;
			// If the staff is a moderator, find the admin of the same group
			// If the staff is an admin, find the owner
			if (ctx.context.session?.user.role === "moderator") {
				bossEmail = (await db
				.select({ email: staff.email})
				.from(staff)
				.where(and(eq(staff.role, 'admin'), eq(staff.group, group))))[0];
			} else if (ctx.context.session?.user.role === "admin") {
				bossEmail = (await db
				.select({ email: staff.email})
				.from(staff)
				.where(eq(staff.role, 'owner')))[0];
			} else return;

			if (!bossEmail) return;

			const ternary = (whatChanged === 'email'
				? `:<br><strong>Old email:</strong> ${currentEmail}<br><strong>New email:</strong> ${newEmail}`
				: `.<br><strong>Email:</strong> ${currentEmail}`);	

			// Send email to boss
			sendMail({
				to: bossEmail.email,
				subject: ("Notice of " + whatChanged + " change - " + currentEmail),
				text: '<p>Hello,</p>'+
    				`<p>A staff member has requested to change their ${whatChanged}${ternary}</p>` +
    				`<p>No action is needed unless the change is unexpected.</p>`
			});
		})
	}
});
