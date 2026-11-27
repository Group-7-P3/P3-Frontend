// scripts/seed.ts
import 'dotenv';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { faker } from '@faker-js/faker';
import * as schema from '../src/lib/server/db/schema';
import { type Role, type LogType, severityByType } from '../src/lib/types';

const isDemo = process.env.DB_TARGET === 'demo';
const connectionString = isDemo ? process.env.DEMO_DATABASE_URL : process.env.DATABASE_URL;

if (!connectionString)
	throw new Error(`${isDemo ? 'DEMO_DATABASE_URL' : 'DATABASE_URL'} is not set`);

console.log(`Seeding ${isDemo ? 'DEMO' : 'LIVE'} database`);

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

	// Clear existing data (in reverse order of dependencies)
	console.log('🧹 Cleaning existing data...');
	await db.delete(schema.log);
	await db.delete(schema.activity);
	await db.delete(schema.subscriptionToProduct);
	await db.delete(schema.subscription);
	await db.delete(schema.product);
	await db.delete(schema.user);
	await db.delete(schema.group);
	await db.delete(schema.productType);

	// Seed Groups
	console.log('👥 Inserting dummy groups...');
	const groupNames = ['INNOVAID', 'Norway', 'Italy'];
	const groups = groupNames.map((g) => ({ name: g }));
	await db.insert(schema.group).values(groups).returning();
	console.log(`✅ Successfully seeded ${groups.length} groups.`);

	// Seed Product Types
	console.log('🆎 Inserting dummy product types...');
	const productTypes = [
		{ id: 20, type: 'pad_pro' },
		{ id: 21, type: 'pad_home' }
	];
	await db.insert(schema.productType).values(productTypes).returning();
	console.log(`✅ Successfully seeded ${productTypes.length} product types.`);

	const usedSerials = new Set();
	const generateUniqueSerial = () => {
		let serial;
		do {
			const pad = (num: number, size = 2) => String(num).padStart(size, '0');
			const year = faker.number.int({ min: 20, max: 26 });
			const week = pad(faker.number.int({ min: 1, max: 52 }));
			const type = faker.helpers.arrayElement([20, 21]);
			const make = pad(faker.number.int({ min: 1, max: 999 }), 3);

			serial = Number(`${year}${week}${type}${make}`);
		} while (usedSerials.has(serial));

		usedSerials.add(serial);
		return serial;
	};

	// Seed Products
	console.log('📦 Inserting dummy products...');
	const dummyProducts = Array.from({ length: 100 }).map(() => {
		const serialNumber = generateUniqueSerial();

		return {
			serialNumber,
			status: faker.helpers.arrayElement(['inactive', 'active', 'archived'] as const),
			createdAt: randomCopenhagenPast(),
			updatedAt: randomCopenhagenPast()
		};
	});

	const insertedProducts = await db.insert(schema.product).values(dummyProducts).returning();
	console.log(`✅ Successfully seeded ${insertedProducts.length} products.`);

	// Seed Users
	console.log('👤 Inserting dummy users...');
	const dummyUsers = Array.from({ length: 100 }).map(() => ({
		managedBy: faker.helpers.arrayElement(['INNOVAID', 'Italy', 'Norway'] as const),
		createdAt: randomCopenhagenPast(),
		updatedAt: randomCopenhagenPast()
	}));

	const insertedUsers = await db.insert(schema.user).values(dummyUsers).returning();
	console.log(`✅ Successfully seeded ${insertedUsers.length} users.`);

	// Seed Subscriptions
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

	// Seed Subscription-Product assignments
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

	// Seed Activities
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

	const staff: { name: string; role: Role; group: string }[] = [
		{ name: 'Alice Owner', role: 'owner', group: 'INNOVAID' },
		{ name: 'Anders Admin', role: 'admin', group: 'INNOVAID' },
		{ name: 'Nora Admin', role: 'admin', group: 'Norway' },
		{ name: 'Sofia Support', role: 'supporter', group: 'Italy' },
		{ name: 'Lars Support', role: 'supporter', group: 'Norway' },
		{ name: 'Marco Support', role: 'supporter', group: 'Italy' }
	];

	const actions = Object.keys(severityByType) as LogType[];

	function generateLog() {
		const actor = faker.helpers.arrayElement(staff);
		const type = faker.helpers.arrayElement(actions);

		return {
			by: actor.name,
			group: actor.group,
			severity: severityByType[type],
			type,
			createdAt: randomCopenhagenPast()
		};
	}

	// Seed logs
	console.log('📝 Inserting dummy logs...');
	const dummyLogs = Array.from({ length: 500 })
		.map(generateLog)
		.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

	const insertedLogs = await db.insert(schema.log).values(dummyLogs).returning();
	console.log(`✅ Successfully seeded ${insertedLogs.length} logs.`);

	console.log('🎉 Seeding completed!');
	await client.end();
	process.exit(0);
}

main().catch(async (err) => {
	console.error('❌ Error seeding database:', err);
	await client.end();
	process.exit(1);
});
