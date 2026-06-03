import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingClient } from "@/components/LandingClient";

export default async function HomePage() {
  const session = await auth();
  
  // Redirect authenticated users to their dashboard
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    if (role === "ADMIN") redirect("/admin");
    if (role === "SELLER") redirect("/seller");
    if (role === "BUYER") redirect("/shop");
  }

  return <LandingClient />;
}
