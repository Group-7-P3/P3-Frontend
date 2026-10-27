import { relations } from 'drizzle-orm';
import { pgTable, serial, integer, text, date, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const staff = pgTable('staff', {
	id: serial('id').primaryKey(),
	email: text('email').notNull(),
	password: text('password').notNull(),
	group: text('group').notNull(),
	type: integer('type').notNull().default(0)
});

export const subscription = pgTable('subscription', {
	license_key: serial('license_key').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	type: integer('type').notNull(),
	maxDevices: integer('max_devices').notNull().default(6),
	createdAt: date('created_at').notNull().defaultNow(),
	expiresAt: date('expires_at').notNull(),
	autoRenew: boolean('auto_renew').notNull().default(false)
});

export const product = pgTable('product', {
	serialNumber: serial('serial_number').primaryKey(),
	status: integer('status').notNull().default(0)
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
