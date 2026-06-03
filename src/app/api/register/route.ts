import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check if user exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Only allow BUYER and SELLER registration (ADMIN is seed-only)
    const validRole = role === "SELLER" ? "SELLER" : "BUYER";

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: validRole,
    }).returning();

    return NextResponse.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
