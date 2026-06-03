import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShopLayoutClient } from "@/components/ShopLayoutClient";
import { CartProvider } from "@/components/CartProvider";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user.id
    ? await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      })
    : session.user.email
      ? await db.query.users.findFirst({
          where: eq(users.email, session.user.email),
        })
      : null;

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "BUYER") {
    redirect("/");
  }

  return (
    <CartProvider>
      <ShopLayoutClient user={session.user}>{children}</ShopLayoutClient>
    </CartProvider>
  );
}
