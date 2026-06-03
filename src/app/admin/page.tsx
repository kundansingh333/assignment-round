import { getDashboardStats } from "@/actions/products";
import { getOrders } from "@/actions/orders";
import { formatINR, formatDate } from "@/lib/format";
import Link from "next/link";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const recentOrders = await getOrders();
  const latestOrders = recentOrders.slice(0, 5);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted text-small">Welcome back, Admin! Here&apos;s your overview.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📦</div>
          <div className="stat-info">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📋</div>
          <div className="stat-info">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">💰</div>
          <div className="stat-info">
            <h3>{formatINR(stats.totalRevenue)}</h3>
            <p>Revenue (Delivered)</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card" style={{ marginTop: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3>Recent Orders</h3>
          <Link href="/admin/orders" className="btn btn-ghost btn-sm">View All →</Link>
        </div>

        {latestOrders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>No orders yet</h3>
            <p>Orders will appear here once buyers start placing them.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} className="font-mono font-semibold">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td>{order.user?.name || "Unknown"}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td className="font-semibold">{formatINR(parseFloat(order.totalAmount))}</td>
                    <td>
                      <span className={`badge badge-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-muted text-small">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
