import { createAccessControl } from 'better-auth/plugins/access';

export const statement = {
	staff: ['read', 'createModerator', 'deleteModerator', 'createAdmin', 'deleteAdmin'] // <-- Permissions available for created roles
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({});

export const moderator = ac.newRole({
	staff: ['read']
});

export const admin = ac.newRole({
	staff: ['read', 'createModerator', 'deleteModerator']
});

export const owner = ac.newRole({
	staff: ['read', 'createModerator', 'deleteModerator', 'createAdmin', 'deleteAdmin']
});
