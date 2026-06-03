import { getProducts } from "@/actions/products";
import { getOrders } from "@/actions/orders";
import { formatINR, parseNumeric } from "@/lib/format";
import Link from "next/link";

export default async function SellerDashboard() {
  const [products, orders] = await Promise.all([
    getProducts(),
    getOrders(),
  ]);

  const activeProducts = products.filter(p => p.isActive).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "PENDING").length;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Seller Dashboard</h1>
          <p className="text-muted text-small">Overview of your products and orders</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📦</div>
          <div className="stat-info">
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>{activeProducts}</h3>
            <p>Active Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">📋</div>
          <div className="stat-info">
            <h3>{totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-info">
            <h3>{pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div className="card">
          <h3 style={{ marginBottom: "16px" }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link href="/seller/products" className="btn btn-secondary w-full">📦 Manage Products</Link>
            <Link href="/seller/orders" className="btn btn-secondary w-full">📋 View Orders</Link>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: "16px" }}>Recent Activity</h3>
          {orders.slice(0, 3).map(order => (
            <div key={order.id} className="flex justify-between items-center" style={{ padding: "8px 0", borderBottom: "1px solid var(--border-primary)" }}>
              <div>
                <span className="font-mono text-small">{order.orderNumber}</span>
                <span className={`badge badge-${order.status.toLowerCase()}`} style={{ marginLeft: "8px" }}>{order.status}</span>
              </div>
              <span className="font-semibold">{formatINR(parseNumeric(order.totalAmount))}</span>
            </div>
          ))}
          {orders.length === 0 && <p className="text-muted text-small">No orders yet</p>}
        </div>
      </div>
    </div>
  );
}
