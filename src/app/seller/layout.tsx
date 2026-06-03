import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SellerLayoutClient } from "@/components/SellerLayoutClient";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function SellerLayout({
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

  if (currentUser.role !== "SELLER") {
    redirect("/");
  }

  return (
    <SellerLayoutClient user={session.user}>{children}</SellerLayoutClient>
  );
}
