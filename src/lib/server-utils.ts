import * as schema from '$lib/server/db/schema';
import { severityByType, type LogType } from './types';

export async function createLog(
	db: typeof import('#lib/server/db/index.ts').db,
	by: string,
	group: string,
	type: LogType
) {
	await db.insert(schema.log).values({
		by,
		group,
		type,
		severity: severityByType[type]
	});
}
