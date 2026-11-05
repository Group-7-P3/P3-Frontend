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
	primaryKey,
	index
} from 'drizzle-orm/pg-core';

export const subscriptionType = pgEnum('subscription_type', ['home', 'home+', 'pro', 'pro+']);
export const productStatus = pgEnum('product_status', ['inactive', 'active', 'deactivated']);

export const user = pgTable(
	'user',
	{
		id: serial('id').primaryKey(),
		customerId: integer('customer_id').notNull(),
		managedBy: text('managed_by').notNull().default('INNOVAID'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(table) => [index('user_managed_by_idx').on(table.managedBy)]
);

export const subscription = pgTable(
	'subscription',
	{
		licenseKey: serial('license_key').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		type: subscriptionType('type').notNull().default('home'),
		maxDevices: integer('max_devices').notNull().default(6),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
		expiresAt: date('expires_at').notNull(),
		autoRenew: boolean('auto_renew').notNull().default(false)
	},
	(table) => [index('subscription_user_id_idx').on(table.userId)]
);

export const product = pgTable('product', {
	serialNumber: serial('serial_number').primaryKey(),
	status: productStatus('status').notNull().default('inactive'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const subscriptionToProduct = pgTable(
	'subscription_to_product',
	{
		licenseKey: integer('license_key')
			.notNull()
			.references(() => subscription.licenseKey, { onDelete: 'cascade' }),
		serialNumber: integer('serial_number')
			.notNull()
			.references(() => product.serialNumber, { onDelete: 'cascade' })
	},
	(table) => [
		primaryKey({ columns: [table.licenseKey, table.serialNumber] }),
		index('subscription_to_product_serial_number_idx').on(table.serialNumber)
	]
);

export const userRelations = relations(user, ({ many }) => ({
	subscription: many(subscription, {
		relationName: 'userToSubscriptions'
	})
}));

export const subscriptionRelations = relations(subscription, ({ many, one }) => ({
	user: one(user, {
		fields: [subscription.userId],
		references: [user.id],
		relationName: 'userToSubscriptions'
	}),
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
