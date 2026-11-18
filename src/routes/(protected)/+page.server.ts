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

	const startDateStr = startDateObj.toString();
	const startDate = startDateObj.toDate(timeZone);
	const endDate = endDateObj.toDate(timeZone);

	//#region Activities
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
	//#endregion

	//#region Subscriptions
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
	//#endregion

	//#region Users
	const users = await db
		.select({ createdAt: schema.user.createdAt })
		.from(schema.user)
		.where(lte(schema.user.createdAt, endDate));
	//#endregion

	//#region Products
	const products = await db
		.select({ sn: schema.product.serialNumber, createdAt: schema.product.createdAt })
		.from(schema.product)
		.where(lte(schema.product.createdAt, endDate));
	//#endregion

	return { activities, totalActivities, subscriptions, users, products };
};
