"use client";

import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/format";
import {
  calculatePrice,
  getPricePerUnit,
  getCompatibleUnits,
  toBaseUnit,
  UNIT_LABELS,
  UNIT_SHORT,
} from "@/lib/units";
import type { DisplayUnit } from "@/lib/units";
import { placeOrder } from "@/actions/orders";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateItem, clearCart, itemCount } = useCart();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const itemTotals = items.map(item => ({
    ...item,
    total: calculatePrice(item.quantity, item.unit, item.basePricePerBaseUnit),
    baseQty: toBaseUnit(item.quantity, item.unit),
    pricePerUnit: getPricePerUnit(item.unit, item.basePricePerBaseUnit),
  }));

  const grandTotal = itemTotals.reduce((sum, item) => sum + item.total, 0);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setSuccess(null);

    try {
      const cartItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
      }));

      const order = await placeOrder(cartItems, notes);
      setSuccess(`Order ${order.orderNumber} placed successfully!`);
      clearCart();
      setNotes("");

      setTimeout(() => {
        router.push("/shop/orders");
      }, 2000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="empty-state" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="icon">🎉</div>
        <h3>{success}</h3>
        <p>Redirecting to your orders...</p>
        <Link href="/shop/orders" className="btn btn-primary" style={{ marginTop: "16px" }}>
          View My Orders
        </Link>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div>
        <div className="topbar">
          <h1>Shopping Cart</h1>
        </div>
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Browse our products and add items to get started.</p>
          <Link href="/shop" className="btn btn-primary" style={{ marginTop: "16px" }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Shopping Cart</h1>
          <p className="text-muted text-small">{itemCount} item{itemCount !== 1 ? "s" : ""} in cart</p>
        </div>
        <button className="btn btn-ghost" onClick={clearCart}>🗑️ Clear Cart</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start" }}>
        {/* Cart Items */}
        <div>
          {itemTotals.map(item => (
            <div key={item.productId} className="cart-item">
              <div className="cart-item-info">
                <h4>{item.productName}</h4>
                <p className="sku">{item.sku}</p>

                {/* Quantity & Unit Controls */}
                <div className="flex items-center gap-md" style={{ marginTop: "12px" }}>
                  <div className="form-group" style={{ marginBottom: 0, minWidth: "100px" }}>
                    <input
                      className="form-input"
                      type="number"
                      min="0.001"
                      step="any"
                      value={item.quantity}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          updateItem(item.productId, val, item.unit);
                        }
                      }}
                      style={{ width: "100px" }}
                    />
                  </div>
                  <select
                    className="form-select"
                    value={item.unit}
                    onChange={e => updateItem(item.productId, item.quantity, e.target.value as DisplayUnit)}
                    style={{ width: "auto", minWidth: "120px" }}
                  >
                    {getCompatibleUnits(item.baseUnit as "g" | "mL" | "unit").map(unit => (
                      <option key={unit} value={unit}>{UNIT_LABELS[unit]}</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeItem(item.productId)}
                    style={{ color: "var(--accent-danger)" }}
                  >
                    🗑️ Remove
                  </button>
                </div>

                {/* Conversion Display */}
                <div className="conversion-display" style={{ marginTop: "8px" }}>
                  {item.quantity} {UNIT_SHORT[item.unit]}
                  <span className="conversion-arrow">→</span>
                  {item.baseQty.toFixed(item.baseQty < 1 ? 4 : 2)} {item.baseUnit}
                  <span style={{ marginLeft: "auto" }}>
                    @ {formatINR(item.pricePerUnit)}/{UNIT_SHORT[item.unit]}
                  </span>
                </div>
              </div>

              <div className="cart-item-price">
                <div className="total">{formatINR(item.total)}</div>
                <div className="breakdown">
                  {item.quantity} {UNIT_SHORT[item.unit]} × {formatINR(item.pricePerUnit)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h3 style={{ marginBottom: "16px" }}>Order Summary</h3>

          {itemTotals.map(item => (
            <div key={item.productId} className="cart-summary-row">
              <span className="text-muted truncate" style={{ maxWidth: "180px" }}>{item.productName}</span>
              <span className="font-semibold">{formatINR(item.total)}</span>
            </div>
          ))}

          <div className="cart-summary-total">
            <span>Total</span>
            <span style={{ color: "var(--accent-primary)" }}>{formatINR(grandTotal)}</span>
          </div>

          <div className="form-group" style={{ marginTop: "16px" }}>
            <label className="form-label">Order Notes (optional)</label>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Special instructions..."
              style={{ minHeight: "60px" }}
            />
          </div>

          <button
            className="btn btn-primary w-full btn-lg"
            onClick={handlePlaceOrder}
            disabled={loading}
            style={{ marginTop: "8px" }}
          >
            {loading ? <span className="spinner" /> : "📋"}
            {loading ? " Placing Order..." : ` Place Order — ${formatINR(grandTotal)}`}
          </button>

          <p className="text-xs text-muted text-center" style={{ marginTop: "12px" }}>
            Order will be sent for admin review
          </p>
        </div>
      </div>
    </div>
  );
}
