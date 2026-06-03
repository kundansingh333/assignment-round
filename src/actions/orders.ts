"use server";

import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateOrderNumber, parseNumeric } from "@/lib/format";
import { toBaseUnit, calculatePrice } from "@/lib/units";
import type { DisplayUnit } from "@/lib/units";

interface CartItem {
  productId: string;
  quantity: number;
  unit: DisplayUnit;
}

export async function placeOrder(items: CartItem[], notes?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Fetch all products for the order
  const productIds = items.map(item => item.productId);
  const productList = await Promise.all(
    productIds.map(id => db.query.products.findFirst({ where: eq(products.id, id) }))
  );

  let totalAmount = 0;
  const orderItemsData = items.map((item, index) => {
    const product = productList[index];
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    if (!product.isActive) throw new Error(`Product is not available: ${product.name}`);

    const basePrice = parseNumeric(product.basePrice);
    const baseQty = toBaseUnit(item.quantity, item.unit);
    const itemTotal = calculatePrice(item.quantity, item.unit, basePrice);
    const unitPrice = itemTotal / item.quantity;

    // Check stock
    const stockQty = parseNumeric(product.stockQuantity);
    if (baseQty > stockQty) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${stockQty} ${product.baseUnit}`);
    }

    totalAmount += itemTotal;

    return {
      productId: item.productId,
      orderedUnit: item.unit,
      orderedQuantity: item.quantity.toFixed(6),
      baseQuantity: baseQty.toFixed(6),
      unitPrice: unitPrice.toFixed(6),
      totalPrice: itemTotal.toFixed(6),
    };
  });

  // Create order
  const [order] = await db.insert(orders).values({
    orderNumber: generateOrderNumber(),
    userId: session.user.id,
    status: "PENDING",
    totalAmount: totalAmount.toFixed(6),
    notes: notes || null,
  }).returning();

  // Create order items
  for (const itemData of orderItemsData) {
    await db.insert(orderItems).values({
      orderId: order.id,
      ...itemData,
    });
  }

  // Deduct stock
  for (let i = 0; i < items.length; i++) {
    const product = productList[i]!;
    const baseQty = toBaseUnit(items[i].quantity, items[i].unit);
    const newStock = parseNumeric(product.stockQuantity) - baseQty;
    await db.update(products)
      .set({ stockQuantity: newStock.toFixed(6), updatedAt: new Date() })
      .where(eq(products.id, product.id));
  }

  revalidatePath("/shop/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/shop");
  revalidatePath("/admin/products");

  return order;
}

export async function getOrders(filters?: {
  userId?: string;
  status?: string;
}) {
  const conditions = [];

  if (filters?.userId) {
    conditions.push(eq(orders.userId, filters.userId));
  }

  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status as "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"));
  }

  return db.query.orders.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      user: true,
      items: {
        with: { product: true },
      },
    },
    orderBy: [desc(orders.createdAt)],
  });
}

export async function getOrder(id: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      user: true,
      items: {
        with: { product: true },
      },
    },
  });
}

export async function updateOrderStatus(id: string, status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED") {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // If cancelling, restore stock
  if (status === "CANCELLED") {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { items: true },
    });

    if (order && order.status !== "CANCELLED") {
      for (const item of order.items) {
        const product = await db.query.products.findFirst({
          where: eq(products.id, item.productId),
        });
        if (product) {
          const restoredStock = parseNumeric(product.stockQuantity) + parseNumeric(item.baseQuantity);
          await db.update(products)
            .set({ stockQuantity: restoredStock.toFixed(6), updatedAt: new Date() })
            .where(eq(products.id, product.id));
        }
      }
    }
  }

  const [updated] = await db.update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  revalidatePath("/admin/orders");
  revalidatePath("/shop/orders");

  return updated;
}

export async function getMyOrders() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.query.orders.findMany({
    where: eq(orders.userId, session.user.id),
    with: {
      items: {
        with: { product: true },
      },
    },
    orderBy: [desc(orders.createdAt)],
  });
}
