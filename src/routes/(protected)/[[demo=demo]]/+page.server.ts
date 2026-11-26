import * as schema from '$lib/server/db/schema';
import { and, between, count, eq, exists, gte, lte, sql, sum } from 'drizzle-orm';
import { today, parseDate } from '@internationalized/date';
import { error } from '@sveltejs/kit';
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

export const load: PageServerLoad = async ({ locals, url, parent }) => {
	/**
	 * Builds the group scoping filters.
	 */
	function groupScope(group: string) {
		const isAll = group === 'INNOVAID';

		return {
			// Users managed by the group
			user: isAll ? undefined : eq(schema.user.managedBy, group),

			// Subscriptions owned by a user the group manages
			subscription: isAll
				? undefined
				: exists(
						locals.db
							.select({ one: sql`1` })
							.from(schema.user)
							.where(
								and(
									eq(schema.user.id, schema.subscription.userId),
									eq(schema.user.managedBy, group)
								)
							)
					),

			// Products attached (via a subscription) to a user the group manages
			product: isAll
				? undefined
				: exists(
						locals.db
							.select({ one: sql`1` })
							.from(schema.subscriptionToProduct)
							.innerJoin(
								schema.subscription,
								eq(schema.subscriptionToProduct.licenseKey, schema.subscription.licenseKey)
							)
							.innerJoin(schema.user, eq(schema.subscription.userId, schema.user.id))
							.where(
								and(
									eq(schema.subscriptionToProduct.serialNumber, schema.product.serialNumber),
									eq(schema.user.managedBy, group)
								)
							)
					),

			// Activities managed by the group
			activity: isAll ? undefined : eq(schema.activity.managedBy, group)
		};
	}

	const staff = locals.user;
	if (!staff) throw error(401, 'You must be signed in to view the dashboard');

	const scope = groupScope(staff.group);

	const { timeZone } = await parent();
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
		locals.db
			.select({
				activity: schema.activity.activity,
				totalUses: count(),
				totalSeconds: sum(schema.activity.seconds)
			})
			.from(schema.activity)
			.where(and(between(schema.activity.time, startDate, endDate), scope.activity))
			.groupBy(schema.activity.activity),
		locals.db
			.select({
				type: schema.subscription.type,
				createdAt: schema.subscription.createdAt,
				expiresAt: schema.subscription.expiresAt
			})
			.from(schema.subscription)
			.where(
				and(
					lte(schema.subscription.createdAt, endDate),
					gte(schema.subscription.expiresAt, startDateStr),
					scope.subscription
				)
			),
		locals.db
			.select({ createdAt: schema.user.createdAt })
			.from(schema.user)
			.where(and(lte(schema.user.createdAt, endDate), scope.user)),
		locals.db
			.select({ sn: schema.product.serialNumber, createdAt: schema.product.createdAt })
			.from(schema.product)
			.where(and(lte(schema.product.createdAt, endDate), scope.product)),
		locals.db
			.select(periodCounts(schema.user.createdAt, cutoffs))
			.from(schema.user)
			.where(scope.user),
		locals.db
			.select(periodCounts(schema.subscription.createdAt, cutoffs))
			.from(schema.subscription)
			.where(scope.subscription),
		locals.db
			.select(periodCounts(schema.product.createdAt, cutoffs))
			.from(schema.product)
			.where(scope.product)
	]);

	const stats = {
		users: userStats,
		subscriptions: subscriptionStats,
		products: productStats
	};

	return { activities, subscriptions, users, products, stats, timeZone };
};
