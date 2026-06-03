import { pgTable, text, timestamp, uuid, varchar, numeric, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ───────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'SELLER', 'BUYER']);
export const dimensionEnum = pgEnum('dimension', ['weight', 'volume', 'count']);
export const baseUnitEnum = pgEnum('base_unit', ['g', 'mL', 'unit']);
export const orderedUnitEnum = pgEnum('ordered_unit', ['g', 'kg', 'mL', 'L', 'unit']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

// ─── Users ───────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').notNull().default('BUYER'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Categories ──────────────────────────────────────────
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Products ────────────────────────────────────────────
// base_price: price per 1 base unit (gram, mL, or unit) in INR
// stock_quantity: quantity in base units
// NUMERIC(20,6) gives 14 integer digits + 6 decimal places
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  dimension: dimensionEnum('dimension').notNull(),
  baseUnit: baseUnitEnum('base_unit').notNull(),
  basePrice: numeric('base_price', { precision: 20, scale: 6 }).notNull(),
  stockQuantity: numeric('stock_quantity', { precision: 20, scale: 6 }).notNull().default('0'),
  minOrderQuantity: numeric('min_order_quantity', { precision: 20, scale: 6 }).default('1'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Orders ──────────────────────────────────────────────
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: varchar('order_number', { length: 20 }).notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: orderStatusEnum('status').notNull().default('PENDING'),
  totalAmount: numeric('total_amount', { precision: 20, scale: 6 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Order Items ─────────────────────────────────────────
// Stores both the user-facing unit/quantity AND the normalized base quantity
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'restrict' }).notNull(),
  orderedUnit: orderedUnitEnum('ordered_unit').notNull(),
  orderedQuantity: numeric('ordered_quantity', { precision: 20, scale: 6 }).notNull(),
  baseQuantity: numeric('base_quantity', { precision: 20, scale: 6 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 20, scale: 6 }).notNull(),
  totalPrice: numeric('total_price', { precision: 20, scale: 6 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ─── Types ───────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
