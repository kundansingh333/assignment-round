"use client";
import { FaArrowRightFromBracket, FaBagShopping, FaCartShopping, FaClipboardList, FaFlask } from 'react-icons/fa6';


import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCart } from "@/components/CartProvider";
import { ReactNode } from "react";

const navItems = [
  { href: "/shop", label: "Browse Products", icon: <FaCartShopping /> },
  { href: "/shop/cart", label: "Cart", icon: <FaBagShopping /> },
  { href: "/shop/orders", label: "My Orders", icon: <FaClipboardList /> },
];

export function ShopLayoutClient({ children, user }: { children: ReactNode; user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2><FaFlask className="icon-inline" /> AasaMedChem</h2>
          <span>Shop</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Navigation</div>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
              {item.href === "/shop/cart" && itemCount > 0 && (
                <span className="badge badge-buyer" style={{ marginLeft: "auto" }}>
                  {itemCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <ThemeToggle />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div className="user-avatar">
              {user.name?.charAt(0) || "B"}
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{user.email}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn btn-ghost w-full"
            style={{ justifyContent: "flex-start" }}
          >
            <FaArrowRightFromBracket className="icon-inline" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="dashboard-content page-enter">
        {children}
      </main>
    </div>
  );
}
