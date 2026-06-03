"use server";

import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, ilike, and, desc, asc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getProducts(filters?: {
  search?: string;
  categoryId?: string;
  dimension?: string;
  sortBy?: string;
  isActive?: boolean;
}) {
  const conditions = [];

  if (filters?.search) {
    conditions.push(
      sql`(${ilike(products.name, `%${filters.search}%`)} OR ${ilike(products.sku, `%${filters.search}%`)})`
    );
  }

  if (filters?.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }

  if (filters?.dimension) {
    conditions.push(eq(products.dimension, filters.dimension as "weight" | "volume" | "count"));
  }

  if (filters?.isActive !== undefined) {
    conditions.push(eq(products.isActive, filters.isActive));
  }

  const orderBy = filters?.sortBy === "price_asc"
    ? asc(products.basePrice)
    : filters?.sortBy === "price_desc"
    ? desc(products.basePrice)
    : filters?.sortBy === "name"
    ? asc(products.name)
    : desc(products.createdAt);

  const result = await db.query.products.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { category: true },
    orderBy: [orderBy],
  });

  return result;
}

export async function getProduct(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: { category: true },
  });
}

export async function createProduct(data: {
  name: string;
  sku: string;
  description?: string;
  categoryId?: string;
  dimension: "weight" | "volume" | "count";
  baseUnit: "g" | "mL" | "unit";
  basePrice: string;
  stockQuantity: string;
  minOrderQuantity?: string;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const [product] = await db.insert(products).values({
      name: data.name,
      sku: data.sku,
      description: data.description || null,
      categoryId: data.categoryId || null,
      dimension: data.dimension,
      baseUnit: data.baseUnit,
      basePrice: data.basePrice,
      stockQuantity: data.stockQuantity,
      minOrderQuantity: data.minOrderQuantity || "1",
    }).returning();

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return product;
  } catch (err: any) {
    if (err.code === "23505") {
      throw new Error("A product with this SKU already exists.");
    }
    console.error("Failed to create product:", err);
    throw new Error("Failed to create product. Please verify your inputs.");
  }
}

export async function updateProduct(id: string, data: {
  name?: string;
  sku?: string;
  description?: string;
  categoryId?: string | null;
  dimension?: "weight" | "volume" | "count";
  baseUnit?: "g" | "mL" | "unit";
  basePrice?: string;
  stockQuantity?: string;
  minOrderQuantity?: string;
  isActive?: boolean;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const [product] = await db.update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return product;
  } catch (err: any) {
    if (err.code === "23505") {
      throw new Error("A product with this SKU already exists.");
    }
    console.error("Failed to update product:", err);
    throw new Error("Failed to update product.");
  }
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function getCategories() {
  return db.query.categories.findMany({
    orderBy: [asc(categories.name)],
  });
}

export async function createCategory(data: { name: string; description?: string }) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const [category] = await db.insert(categories).values(data).returning();
  revalidatePath("/admin/categories");
  return category;
}

export async function updateCategory(id: string, data: { name?: string; description?: string }) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const [category] = await db.update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();

  revalidatePath("/admin/categories");
  return category;
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
}

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
  const [categoryCount] = await db.select({ count: sql<number>`count(*)` }).from(categories);
  
  const { orders: ordersTable } = await import("@/db/schema");
  const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable);
  const [pendingCount] = await db.select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(eq(ordersTable.status, "PENDING"));
  const [revenueResult] = await db.select({ 
    total: sql<string>`COALESCE(SUM(CAST(total_amount AS NUMERIC)), 0)` 
  }).from(ordersTable).where(eq(ordersTable.status, "DELIVERED"));

  return {
    totalProducts: Number(productCount.count),
    totalCategories: Number(categoryCount.count),
    totalOrders: Number(orderCount.count),
    pendingOrders: Number(pendingCount.count),
    totalRevenue: parseFloat(revenueResult.total || "0"),
  };
}
