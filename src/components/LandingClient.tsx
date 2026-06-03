"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function LandingClient() {
  return (
    <div>
      {/* Navigation */}
      <nav className="landing-nav">
        <span className="logo">⚗️ AasaMedChem</span>
        <div className="nav-links">
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <h1>
          Precision Inventory for<br />
          <span className="highlight">Chemical Excellence</span>
        </h1>
        <p>
          Manage your lab inventory with exact unit conversions, smart quotations, 
          and real-time order tracking. Built for chemical suppliers who demand accuracy.
        </p>
        <div className="cta-group">
          <Link href="/register" className="btn btn-primary btn-lg">
            🚀 Start Free
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Sign In →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="feature-card card">
          <div className="icon">⚖️</div>
          <h3>Smart Unit Conversion</h3>
          <p>
            Seamlessly convert between grams, kilograms, liters, milliliters, and units.
            All calculations are precise to 6 decimal places.
          </p>
        </div>
        <div className="feature-card card">
          <div className="icon">💰</div>
          <h3>INR Pricing Engine</h3>
          <p>
            Automatic price calculation based on quantity and unit selection.
            Supports high-precision decimal values for accurate chemical pricing.
          </p>
        </div>
        <div className="feature-card card">
          <div className="icon">📦</div>
          <h3>Order Management</h3>
          <p>
            Full quotation-to-delivery workflow with status tracking.
            Admins can review orders with complete conversion breakdowns.
          </p>
        </div>
        <div className="feature-card card">
          <div className="icon">🔐</div>
          <h3>Role-Based Access</h3>
          <p>
            Three distinct roles — Admin, Seller, and Buyer — each with
            tailored dashboards and permissions.
          </p>
        </div>
        <div className="feature-card card">
          <div className="icon">🔍</div>
          <h3>Smart Search & Filter</h3>
          <p>
            Find products instantly with full-text search, category filters,
            dimension filters, and price sorting.
          </p>
        </div>
        <div className="feature-card card">
          <div className="icon">📊</div>
          <h3>Inventory Analytics</h3>
          <p>
            Real-time stock levels, low-stock alerts, and revenue tracking
            on the admin dashboard.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        textAlign: "center", 
        padding: "48px 24px", 
        color: "var(--text-tertiary)",
        fontSize: "0.85rem",
        borderTop: "1px solid var(--border-primary)"
      }}>
        <p>⚗️ AasaMedChem — Inventory & Order Management System</p>
        <p style={{ marginTop: "8px" }}>
          Built with Next.js 15 · Neon PostgreSQL · Drizzle ORM
        </p>
      </footer>
    </div>
  );
}
