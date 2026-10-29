// scripts/seed.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { faker } from '@faker-js/faker';
import * as schema from '../src/lib/server/db/schema';
import 'dotenv';
import 'dotenv/config';

const connectionString =
	process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/local';

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
	console.log('🌱 Starting database seeding...');

	// 1. Clear existing data if needed (in reverse order of foreign keys)
	console.log('🧹 Cleaning existing data...');
	await db.delete(schema.subscription);
	await db.delete(schema.product);
	await db.delete(schema.user);

	// 2. Seed Products
	console.log('📦 Inserting dummy products...');
	const dummyProducts = Array.from({ length: 100 }).map(() => ({
		serialNumber: faker.number.int({ min: 10000, max: 99999 }),
		status: faker.number.int({ min: 0, max: 2 }),
		createdAt: faker.date.past().toISOString(),
		updatedAt: faker.date.past().toISOString()
	}));

	const insertedProducts = await db.insert(schema.product).values(dummyProducts).returning();
	console.log(`✅ Successfully seeded ${insertedProducts.length} products.`);

	// 3. Seed Users
	console.log('👤 Inserting dummy users...');
	const dummyUsers = Array.from({ length: 100 }).map(() => ({
		customerId: faker.number.int({ min: 1000, max: 9999 }),
		managedBy: faker.company.name(),
		createdAt: faker.date.past().toISOString(),
		updatedAt: faker.date.past().toISOString()
	}));

	const insertedUsers = await db.insert(schema.user).values(dummyUsers).returning();
	console.log(`✅ Successfully seeded ${insertedUsers.length} users.`);

	// 4. Seed Subscriptions
	console.log('💳 Inserting dummy subscriptions...');
	const dummySubscriptions = insertedUsers.flatMap((user) => {
		const subCount = faker.number.int({ min: 1, max: 2 });

		return Array.from({ length: subCount }).map(() => ({
			userId: user.id,
			type: faker.number.int({ min: 1, max: 3 }),
			expiresAt: faker.date.future().toISOString(),
			license_key: faker.number.int({ min: 100000, max: 999999 }), // Numeric license key matching schema
			maxDevices: faker.number.int({ min: 1, max: 5 }),
			createdAt: faker.date.past().toISOString(),
			updatedAt: faker.date.past().toISOString(),
			autoRenew: faker.datatype.boolean()
		}));
	});

	const insertedSubscriptions = await db
		.insert(schema.subscription)
		.values(dummySubscriptions)
		.returning();
	console.log(`✅ Successfully seeded ${insertedSubscriptions.length} subscriptions.`);

	console.log('🎉 Seeding completed!');
	await client.end();
	process.exit(0);
}

main().catch((err) => {
	console.error('❌ Error seeding database:', err);
	process.exit(1);
});
