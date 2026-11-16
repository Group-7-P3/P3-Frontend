import { db } from '#lib/server/db/index.ts';
import * as schema from '$lib/server/db/schema';
import { and, between, count, gte, lte, sum } from 'drizzle-orm';
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
			// Fallback to 1 month ago if invalid
		}
	}

	let endDateObj = currentDate;
	const endParam = url.searchParams.get('end');
	if (endParam) {
		try {
			endDateObj = parseDate(endParam);
		} catch {
			// Fallback to today if invalid
		}
	}

	const startDate = startDateObj.toDate(timeZone);
	const endDate = endDateObj.toDate(timeZone);

	const startDateStr = startDateObj.toString();
	// const endDateStr = endDateObj.toString();

	const activities = await db
		.select({
			activity: schema.activity.activity,
			totalUses: count(),
			totalSeconds: sum(schema.activity.seconds)
		})
		.from(schema.activity)
		.where(between(schema.activity.time, startDate, endDate))
		.groupBy(schema.activity.activity);

	const [{ totalActivities }] = await db.select({ totalActivities: count() }).from(schema.activity);

	// Fetch raw subscriptions that overlap with the selected window
	// (Created on or before the end date, and expires on or after the start date)
	const subscriptions = await db
		.select({
			type: schema.subscription.type,
			createdAt: schema.subscription.createdAt,
			expiresAt: schema.subscription.expiresAt
		})
		.from(schema.subscription)
		.where(
			and(
				lte(schema.subscription.createdAt, endDate),
				gte(schema.subscription.expiresAt, startDateStr)
			)
		);

	return { activities, totalActivities, subscriptions };
};
