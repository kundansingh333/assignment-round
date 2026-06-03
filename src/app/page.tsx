import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingClient } from "@/components/LandingClient";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function HomePage() {
  const session = await auth();

  // Redirect authenticated users to their dashboard
  if (session?.user) {
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

    const role = currentUser.role;
    if (role === "ADMIN") redirect("/admin");
    if (role === "SELLER") redirect("/seller");
    if (role === "BUYER") redirect("/shop");
  }

  return <LandingClient />;
}
