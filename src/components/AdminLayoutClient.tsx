"use client";
import { FaArrowRightFromBracket, FaArrowTrendUp, FaBoxOpen, FaChartSimple, FaClipboardList, FaFlask, FaTags } from 'react-icons/fa6';


import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: <FaChartSimple /> },
  { href: "/admin/products", label: "Products", icon: <FaBoxOpen /> },
  { href: "/admin/categories", label: "Categories", icon: <FaTags /> },
  { href: "/admin/orders", label: "Orders", icon: <FaClipboardList /> },
  { href: "/admin/inventory", label: "Inventory", icon: <FaArrowTrendUp /> },
];

export function AdminLayoutClient({ children, user }: { children: ReactNode; user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2><FaFlask className="icon-inline" /> AasaMedChem</h2>
          <span>Admin Panel</span>
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
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <ThemeToggle />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div className="user-avatar">
              {user.name?.charAt(0) || "A"}
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
