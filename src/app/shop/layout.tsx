import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShopLayoutClient } from "@/components/ShopLayoutClient";
import { CartProvider } from "@/components/CartProvider";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "BUYER" && role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <CartProvider>
      <ShopLayoutClient user={session.user}>
        {children}
      </ShopLayoutClient>
    </CartProvider>
  );
}
