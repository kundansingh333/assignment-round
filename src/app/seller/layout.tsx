import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SellerLayoutClient } from "@/components/SellerLayoutClient";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "SELLER" && role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <SellerLayoutClient user={session.user}>
      {children}
    </SellerLayoutClient>
  );
}
