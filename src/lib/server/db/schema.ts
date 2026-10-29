import { relations } from 'drizzle-orm';
import {
	pgTable,
	pgEnum,
	serial,
	integer,
	text,
	date,
	timestamp,
	boolean,
	primaryKey
} from 'drizzle-orm/pg-core';

export const subscriptionType = pgEnum('subscription_type', ['home', 'home+', 'pro', 'pro+']);
export const staffRoleType = pgEnum('staff_type', ['owner', 'admin', 'moderator']);
export const productType = pgEnum('product_type', ['pad', 'pod']);

export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	customerId: integer('customer_id').notNull(),
	managedBy: text('managed_by').notNull().default('global'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const subscription = pgTable('subscription', {
	license_key: serial('license_key').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	type: integer('type').notNull(),
	maxDevices: integer('max_devices').notNull().default(6),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	expiresAt: date('expires_at').notNull(),
	autoRenew: boolean('auto_renew').notNull().default(false)
});

export const product = pgTable('product', {
	serialNumber: serial('serial_number').primaryKey(),
	status: integer('status').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const subscriptionToProduct = pgTable(
	'subscription_to_product',
	{
		license_key: integer('license_key')
			.notNull()
			.references(() => subscription.license_key, { onDelete: 'cascade' }),
		serialNumber: integer('serial_number')
			.notNull()
			.references(() => product.serialNumber, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.license_key, t.serialNumber] })]
);

export const userRelations = relations(user, ({ many }) => ({
	subscription: many(subscription)
}));

export const subscriptionRelations = relations(subscription, ({ many, one }) => ({
	user: one(user),
	subscriptionToProduct: many(subscriptionToProduct)
}));

export const productRelations = relations(product, ({ many }) => ({
	subscriptionToProduct: many(subscriptionToProduct)
}));

export const subscriptionToProductRelations = relations(subscriptionToProduct, ({ one }) => ({
	subscription: one(subscription),
	product: one(product)
}));

export * from './auth.schema';
