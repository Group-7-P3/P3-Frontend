import { db } from '#lib/server/db/index.ts';
import * as schema from '$lib/server/db/schema';
import { and, between, count, gte, lte, sql, sum } from 'drizzle-orm';
import { today, getLocalTimeZone, parseDate } from '@internationalized/date';
import type { PageServerLoad } from './$types';

type TimestampColumn =
	| typeof schema.user.createdAt
	| typeof schema.subscription.createdAt
	| typeof schema.product.createdAt;

interface PeriodCutoffs {
	day: Date;
	week: Date;
	month: Date;
	year: Date;
}

function periodCounts(createdAtCol: TimestampColumn, cutoffs: PeriodCutoffs) {
	return {
		day: count(sql`CASE WHEN ${createdAtCol} >= ${cutoffs.day.toISOString()} THEN 1 END`),
		week: count(sql`CASE WHEN ${createdAtCol} >= ${cutoffs.week.toISOString()} THEN 1 END`),
		month: count(sql`CASE WHEN ${createdAtCol} >= ${cutoffs.month.toISOString()} THEN 1 END`),
		year: count(sql`CASE WHEN ${createdAtCol} >= ${cutoffs.year.toISOString()} THEN 1 END`),
		total: count()
	};
}

export const load: PageServerLoad = async ({ url }) => {
	const timeZone = getLocalTimeZone();
	const currentDate = today(timeZone);

	let startDateObj = currentDate.set({ day: 1, month: 1 });
	const startParam = url.searchParams.get('start');
	if (startParam) {
		try {
			startDateObj = parseDate(startParam);
		} catch {
			// Fallback to 1st of January if invalid
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

	const cutoffs: PeriodCutoffs = {
		day: currentDate.subtract({ days: 1 }).toDate(timeZone),
		week: currentDate.subtract({ weeks: 1 }).toDate(timeZone),
		month: currentDate.subtract({ months: 1 }).toDate(timeZone),
		year: currentDate.subtract({ years: 1 }).toDate(timeZone)
	};

	const [
		activities,
		subscriptions,
		users,
		products,
		[userStats],
		[subscriptionStats],
		[productStats]
	] = await Promise.all([
		//#region Activities
		db
			.select({
				activity: schema.activity.activity,
				totalUses: count(),
				totalSeconds: sum(schema.activity.seconds)
			})
			.from(schema.activity)
			.where(between(schema.activity.time, startDate, endDate))
			.groupBy(schema.activity.activity),
		//#endregion

		//#region Subscriptions
		db
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
			),
		//#endregion

		//#region Users
		db
			.select({ createdAt: schema.user.createdAt })
			.from(schema.user)
			.where(lte(schema.user.createdAt, endDate)),
		//#endregion

		//#region Products
		db
			.select({ sn: schema.product.serialNumber, createdAt: schema.product.createdAt })
			.from(schema.product)
			.where(lte(schema.product.createdAt, endDate)),
		//#endregion

		//#region Period Totals
		db.select(periodCounts(schema.user.createdAt, cutoffs)).from(schema.user),
		db.select(periodCounts(schema.subscription.createdAt, cutoffs)).from(schema.subscription),
		db.select(periodCounts(schema.product.createdAt, cutoffs)).from(schema.product)
		//#endregion
	]);

	const stats = {
		users: userStats,
		subscriptions: subscriptionStats,
		products: productStats
	};

	return { activities, subscriptions, users, products, stats };
};
