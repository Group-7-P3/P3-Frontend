import { db } from '#lib/server/db/index.ts';
import * as schema from '$lib/server/db/schema';
import { between, count, sum } from 'drizzle-orm';
import { today, getLocalTimeZone, parseDate } from '@internationalized/date';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const timeZone = getLocalTimeZone();
	const currentDate = today(timeZone);

	let startDateObj = currentDate.subtract({ months: 1 });
	const startParam = url.searchParams.get('start');
	if (startParam) {
		try {
			startDateObj = parseDate(startParam);
		} catch {
			// Fallback to 1 month ago if the query param is invalid
		}
	}

	let endDateObj = currentDate;
	const endParam = url.searchParams.get('end');
	if (endParam) {
		try {
			endDateObj = parseDate(endParam);
		} catch {
			// Fallback to today if the query param is invalid
		}
	}

	const startDate = startDateObj.toDate(timeZone);
	const endDate = endDateObj.toDate(timeZone);

	const activities = await db
		.select({
			activity: schema.activity.activity,
			totalUses: count(),
			totalSeconds: sum(schema.activity.seconds)
		})
		.from(schema.activity)
		.where(between(schema.activity.time, startDate, endDate))
		.groupBy(schema.activity.activity);

	console.log(activities);

	const [{ totalActivities }] = await db.select({ totalActivities: count() }).from(schema.activity);

	return { activities, totalActivities };
};
