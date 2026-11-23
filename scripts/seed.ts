// scripts/seed.ts
import 'dotenv';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { faker } from '@faker-js/faker';
import * as schema from '../src/lib/server/db/schema';

const connectionString =
	process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/local';

const client = postgres(connectionString);
const db = drizzle(client, { schema });

// Helper to ensure generated dates align correctly with Copenhagen time (Europe/Copenhagen)
function getCopenhagenDate(date: Date = new Date()): Date {
	const copenhagenString = date.toLocaleString('en-US', { timeZone: 'Europe/Copenhagen' });
	return new Date(copenhagenString);
}

// Generate a random date strictly between 1 year ago and now (Copenhagen timezone)
function randomCopenhagenPast(): Date {
	const now = new Date();
	const past = new Date();
	past.setFullYear(now.getFullYear() - 2);

	const rawDate = faker.date.between({ from: past, to: now });
	return getCopenhagenDate(rawDate);
}

async function main() {
	console.log(
		'🌱 Starting database seeding (Copenhagen timezone, strictly past year up to today)...'
	);

	// 0. Clear existing data (in reverse order of dependencies)
	console.log('🧹 Cleaning existing data...');
	await db.delete(schema.activity);
	await db.delete(schema.subscriptionToProduct);
	await db.delete(schema.subscription);
	await db.delete(schema.product);
	await db.delete(schema.user);
	await db.delete(schema.group);

	// 1. Seed Groups
	console.log('📦 Inserting dummy groups...');
	const groupNames = ['INNOVAID', 'Norway', 'Italy'];
	const groups = groupNames.map((g) => ({ name: g }));
	await db.insert(schema.group).values(groups).returning();

	// 2. Seed Products
	console.log('📦 Inserting dummy products...');
	const dummyProducts = Array.from({ length: 100 }).map(() => ({
		serialNumber: faker.number.int({ min: 10000, max: 99999 }),
		status: faker.helpers.arrayElement(['inactive', 'active', 'deactivated'] as const),
		createdAt: randomCopenhagenPast(),
		updatedAt: randomCopenhagenPast()
	}));

	const insertedProducts = await db.insert(schema.product).values(dummyProducts).returning();
	console.log(`✅ Successfully seeded ${insertedProducts.length} products.`);

	// 3. Seed Users
	console.log('👤 Inserting dummy users...');
	const dummyUsers = Array.from({ length: 100 }).map(() => ({
		managedBy: faker.helpers.arrayElement(['INNOVAID', 'Italy', 'Norway'] as const),
		createdAt: randomCopenhagenPast(),
		updatedAt: randomCopenhagenPast()
	}));

	const insertedUsers = await db.insert(schema.user).values(dummyUsers).returning();
	console.log(`✅ Successfully seeded ${insertedUsers.length} users.`);

	// 4. Seed Subscriptions
	console.log('💳 Inserting dummy subscriptions...');
	const dummySubscriptions = insertedUsers.flatMap((user) => {
		const subCount = faker.number.int({ min: 1, max: 3 });

		return Array.from({ length: subCount }).map(() => {
			const createdAt = randomCopenhagenPast();
			const durationDays = faker.number.int({ min: 30, max: 365 });
			const expiresAt = new Date(createdAt);
			expiresAt.setDate(expiresAt.getDate() + durationDays);
			const finalExpiresAt = getCopenhagenDate(expiresAt);

			return {
				userId: user.id,
				customerId: faker.number.int({ min: 1000, max: 9999 }),
				type: faker.helpers.arrayElement(['home', 'pro', 'home+', 'pro+'] as const),
				expiresAt: finalExpiresAt.toISOString(),
				licenseKey: faker.number.int({ min: 100000, max: 999999 }),
				createdAt: createdAt,
				updatedAt: createdAt
			};
		});
	});

	const insertedSubscriptions = await db
		.insert(schema.subscription)
		.values(dummySubscriptions)
		.returning();

	console.log(`✅ Successfully seeded ${insertedSubscriptions.length} subscriptions.`);

	// 5. Seed Subscription-Product assignments
	console.log('🔗 Linking products to subscriptions...');
	const subscriptionProductLinks = insertedProducts.map((product) => ({
		serialNumber: product.serialNumber,
		licenseKey: faker.helpers.arrayElement(insertedSubscriptions).licenseKey
	}));

	const insertedLinks = await db
		.insert(schema.subscriptionToProduct)
		.values(subscriptionProductLinks)
		.returning();

	console.log(`✅ Successfully seeded ${insertedLinks.length} subscription-product assignments.`);

	// 6. Seed Activities
	console.log('📊 Inserting dummy activities...');

	const activityNames = [
		'simon_says',
		'neglect_color',
		'sequence',
		'whack_a_mole',
		'reaction',
		'reflex',
		'balance',
		'force'
	];

	const dummyActivities = Array.from({ length: 500 }).map(() => ({
		activity: faker.helpers.arrayElement(activityNames),
		time: randomCopenhagenPast(),
		seconds: faker.number.int({ min: 1, max: 60 }),
		managedBy: faker.helpers.arrayElement(['INNOVAID', 'Italy', 'Norway'] as const)
	}));

	const insertedActivities = await db.insert(schema.activity).values(dummyActivities).returning();

	console.log(`✅ Successfully seeded ${insertedActivities.length} activities.`);

	console.log('🎉 Seeding completed!');
	await client.end();
	process.exit(0);
}

main().catch(async (err) => {
	console.error('❌ Error seeding database:', err);
	await client.end();
	process.exit(1);
});
