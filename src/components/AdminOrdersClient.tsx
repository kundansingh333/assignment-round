"use client";
import { FaClipboardList } from 'react-icons/fa6';


import { useState } from "react";
import { updateOrderStatus } from "@/actions/orders";
import { formatINR, formatDate, parseNumeric } from "@/lib/format";
import { fromBaseUnit, UNIT_SHORT } from "@/lib/units";
import type { DisplayUnit } from "@/lib/units";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  orderedUnit: string;
  orderedQuantity: string;
  baseQuantity: string;
  unitPrice: string;
  totalPrice: string;
  product: {
    name: string;
    sku: string;
    baseUnit: string;
    basePrice: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  notes: string | null;
  createdAt: Date;
  user: { name: string; email: string } | null;
  items: OrderItem[];
}

const statusOptions = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function AdminOrdersClient({ orders: initialOrders }: { orders: Order[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const router = useRouter();

  const filteredOrders = statusFilter === "all"
    ? initialOrders
    : initialOrders.filter(o => o.status === statusFilter);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as typeof statusOptions[number]);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Orders</h1>
          <p className="text-muted text-small">{initialOrders.length} total orders</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="filters-bar">
        <button
          className={`filter-chip ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          All ({initialOrders.length})
        </button>
        {statusOptions.map(status => {
          const count = initialOrders.filter(o => o.status === status).length;
          return (
            <button
              key={status}
              className={`filter-chip ${statusFilter === status ? "active" : ""}`}
              onClick={() => setStatusFilter(status)}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="icon"><FaClipboardList /></div>
          <h3>No orders found</h3>
          <p>No orders match the current filter.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredOrders.map(order => (
            <div key={order.id} className="card">
              {/* Order Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-md">
                  <div>
                    <span className="font-mono font-semibold">{order.orderNumber}</span>
                    <div className="text-xs text-muted">{formatDate(order.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-md">
                  <div className="text-right">
                    <div className="text-xs text-muted">Customer</div>
                    <div className="text-small font-semibold">{order.user?.name || "Unknown"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted">Items</div>
                    <div className="text-small font-semibold">{order.items.length}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted">Total</div>
                    <div className="font-semibold" style={{ color: "var(--accent-primary)" }}>
                      {formatINR(parseNumeric(order.totalAmount))}
                    </div>
                  </div>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                  <span style={{ fontSize: "1.2rem" }}>{expandedOrder === order.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div style={{ marginTop: "20px", borderTop: "1px solid var(--border-primary)", paddingTop: "20px" }}>
                  {/* Status Update */}
                  <div className="flex items-center gap-md mb-md">
                    <label className="form-label" style={{ marginBottom: 0 }}>Update Status:</label>
                    <select
                      className="form-select"
                      value={order.status}
                      onChange={e => handleStatusUpdate(order.id, e.target.value)}
                      style={{ width: "auto" }}
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {order.notes && (
                    <div style={{
                      padding: "12px",
                      background: "var(--bg-tertiary)",
                      borderRadius: "var(--radius-md)",
                      marginBottom: "16px",
                      fontSize: "0.85rem",
                    }}>
                      <strong>Notes:</strong> {order.notes}
                    </div>
                  )}

                  {/* Order Items Table */}
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>SKU</th>
                          <th>Ordered</th>
                          <th>Base Equivalent</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map(item => (
                          <tr key={item.id}>
                            <td className="font-semibold">{item.product.name}</td>
                            <td><code className="font-mono text-small">{item.product.sku}</code></td>
                            <td>
                              <span className="font-semibold">
                                {parseNumeric(item.orderedQuantity)} {UNIT_SHORT[item.orderedUnit as DisplayUnit]}
                              </span>
                            </td>
                            <td>
                              <div className="conversion-display" style={{ display: "inline-flex" }}>
                                {parseNumeric(item.baseQuantity)} {item.product.baseUnit}
                                <span className="conversion-arrow">↔</span>
                                {parseNumeric(item.orderedQuantity)} {item.orderedUnit}
                              </div>
                            </td>
                            <td>{formatINR(parseNumeric(item.unitPrice))}/{item.orderedUnit}</td>
                            <td className="font-semibold">{formatINR(parseNumeric(item.totalPrice))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Order Total */}
                  <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: "16px 0",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                  }}>
                    Order Total: <span style={{ color: "var(--accent-primary)", marginLeft: "8px" }}>
                      {formatINR(parseNumeric(order.totalAmount))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
