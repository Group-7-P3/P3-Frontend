export type Role = 'owner' | 'admin' | 'supporter';
export type Severity = 'minor' | 'medium' | 'major' | 'critical';
export type Log =
	| 'create_user'
	| 'update_user'
	| 'create_product'
	| 'update_product'
	| 'create_staff'
	| 'update_staff'
	| 'delete_staff'
	| 'create_subscription'
	| 'update_subscription'
	| 'ran_query'
	| 'changed_password'
	| 'changed_email';
export const severities = ['minor', 'medium', 'major', 'critical'] as const;
export const logTypes = [
	'create_user',
	'update_user',
	'create_product',
	'update_product',
	'create_staff',
	'update_staff',
	'delete_staff',
	'create_subscription',
	'update_subscription',
	'ran_query',
	'changed_password',
	'changed_email'
] as const;
