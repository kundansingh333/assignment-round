"use client";
import { FaBoxOpen, FaCartShopping, FaCheck, FaClipboardList, FaHourglassHalf, FaTruckFast, FaXmark } from 'react-icons/fa6';


import { useState } from "react";
import { formatINR, formatDate, parseNumeric } from "@/lib/format";
import { UNIT_SHORT } from "@/lib/units";
import type { DisplayUnit } from "@/lib/units";
import Link from "next/link";

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
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  notes: string | null;
  createdAt: Date;
  items: OrderItem[];
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <FaHourglassHalf />,
  CONFIRMED: <FaCheck />,
  SHIPPED: <FaTruckFast />,
  DELIVERED: <FaBoxOpen />,
  CANCELLED: <FaXmark />,
};

export function ShopOrdersClient({ orders }: { orders: Order[] }) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>My Orders</h1>
          <p className="text-muted text-small">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/shop" className="btn btn-primary"><FaCartShopping className="icon-inline" /> Continue Shopping</Link>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon"><FaClipboardList /></div>
          <h3>No orders yet</h3>
          <p>Browse products and place your first order!</p>
          <Link href="/shop" className="btn btn-primary" style={{ marginTop: "16px" }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.map(order => (
            <div key={order.id} className="card">
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
                <div>
                  <span className="font-mono font-semibold">{order.orderNumber}</span>
                  <div className="text-xs text-muted">{formatDate(order.createdAt)}</div>
                </div>

                <div className="flex items-center gap-md">
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
                  <span className={`badge badge-${order.status.toLowerCase()}`}>
                    {statusIcons[order.status]} {order.status}
                  </span>
                  <span style={{ fontSize: "1.2rem" }}>{expandedOrder === order.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div style={{ marginTop: "20px", borderTop: "1px solid var(--border-primary)", paddingTop: "20px" }}>
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

                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Base Equivalent</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map(item => (
                          <tr key={item.id}>
                            <td>
                              <div className="font-semibold">{item.product.name}</div>
                              <div className="text-xs text-muted font-mono">{item.product.sku}</div>
                            </td>
                            <td className="font-semibold">
                              {parseNumeric(item.orderedQuantity)} {UNIT_SHORT[item.orderedUnit as DisplayUnit]}
                            </td>
                            <td>
                              <div className="conversion-display" style={{ display: "inline-flex" }}>
                                = {parseNumeric(item.baseQuantity)} {item.product.baseUnit}
                              </div>
                            </td>
                            <td>{formatINR(parseNumeric(item.unitPrice))}/{item.orderedUnit}</td>
                            <td className="font-semibold">{formatINR(parseNumeric(item.totalPrice))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

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
