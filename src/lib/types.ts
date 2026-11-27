export type Role = 'owner' | 'admin' | 'supporter';
export type LogSeverity = 'minor' | 'medium' | 'major' | 'critical';
export type LogType =
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
export const severityByType: Record<LogType, LogSeverity> = {
	create_user: 'minor',
	update_user: 'minor',
	create_product: 'minor',
	update_product: 'medium',
	create_subscription: 'medium',
	update_subscription: 'medium',
	update_staff: 'medium',
	create_staff: 'major',
	changed_email: 'major',
	changed_password: 'major',
	ran_query: 'major',
	delete_staff: 'critical'
};
