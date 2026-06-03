"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatINR, parseNumeric } from "@/lib/format";
import {
  getPricePerUnit,
  getCompatibleUnits,
  autoDisplayUnit,
  UNIT_LABELS,
  UNIT_SHORT,
  DIMENSION_UNITS,
} from "@/lib/units";
import type { DisplayUnit, BaseUnit } from "@/lib/units";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  categoryId: string | null;
  dimension: "weight" | "volume" | "count";
  baseUnit: "g" | "mL" | "unit";
  basePrice: string;
  stockQuantity: string;
  minOrderQuantity: string | null;
  isActive: boolean;
  category?: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

export function ShopProductsClient({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dimensionFilter, setDimensionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [addingProduct, setAddingProduct] = useState<Product | null>(null);
  const [addQty, setAddQty] = useState<string>("1");
  const [addUnit, setAddUnit] = useState<DisplayUnit>("g");
  const { addItem } = useCart();
  const router = useRouter();

  // Filter and sort
  let filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || p.categoryId === categoryFilter;
    const matchDimension = dimensionFilter === "all" || p.dimension === dimensionFilter;
    return matchSearch && matchCategory && matchDimension;
  });

  filtered = filtered.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price_asc") return parseNumeric(a.basePrice) - parseNumeric(b.basePrice);
    if (sortBy === "price_desc") return parseNumeric(b.basePrice) - parseNumeric(a.basePrice);
    return 0;
  });

  const openAddToCart = (product: Product) => {
    setAddingProduct(product);
    setAddQty("1");
    // Set default unit to the "bigger" unit if possible
    const units = getCompatibleUnits(product.baseUnit);
    setAddUnit(units[units.length - 1]);
  };

  const handleAddToCart = () => {
    if (!addingProduct || !addQty || parseFloat(addQty) <= 0) return;

    const qty = parseFloat(addQty);
    addItem({
      productId: addingProduct.id,
      productName: addingProduct.name,
      sku: addingProduct.sku,
      quantity: qty,
      unit: addUnit,
      baseUnit: addingProduct.baseUnit,
      basePricePerBaseUnit: parseNumeric(addingProduct.basePrice),
      dimension: addingProduct.dimension,
    });

    setAddingProduct(null);
    router.push("/shop/cart");
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Browse Products</h1>
          <p className="text-muted text-small">{filtered.length} products available</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ width: "auto", minWidth: "160px" }}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          className="form-select"
          value={dimensionFilter}
          onChange={e => setDimensionFilter(e.target.value)}
          style={{ width: "auto", minWidth: "130px" }}
        >
          <option value="all">All Types</option>
          <option value="weight">⚖️ Weight</option>
          <option value="volume">🧪 Volume</option>
          <option value="count">📦 Count</option>
        </select>

        <select
          className="form-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ width: "auto", minWidth: "130px" }}
        >
          <option value="name">Sort: Name</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {/* Add to Cart Modal */}
      {addingProduct && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setAddingProduct(null); }}>
          <div className="modal">
            <div className="modal-header">
              <h3>Add to Cart</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setAddingProduct(null)}>✕</button>
            </div>
            <div className="modal-body">
              <h4 style={{ marginBottom: "4px" }}>{addingProduct.name}</h4>
              <p className="text-small text-muted font-mono" style={{ marginBottom: "16px" }}>{addingProduct.sku}</p>

              {/* Show available prices per unit */}
              <div style={{ marginBottom: "20px" }}>
                <label className="form-label">Price per unit:</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                  {getCompatibleUnits(addingProduct.baseUnit).map(unit => (
                    <div key={unit} className="badge" style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      padding: "6px 12px",
                      fontSize: "0.85rem",
                    }}>
                      {formatINR(getPricePerUnit(unit, parseNumeric(addingProduct.basePrice)))} / {UNIT_SHORT[unit]}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0.001"
                    step="any"
                    value={addQty}
                    onChange={e => setAddQty(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select
                    className="form-select"
                    value={addUnit}
                    onChange={e => setAddUnit(e.target.value as DisplayUnit)}
                  >
                    {getCompatibleUnits(addingProduct.baseUnit).map(unit => (
                      <option key={unit} value={unit}>{UNIT_LABELS[unit]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Price Calculation */}
              {addQty && parseFloat(addQty) > 0 && (
                <div className="card" style={{
                  background: "var(--accent-primary-light)",
                  border: "1px solid var(--accent-primary)",
                  marginTop: "8px",
                }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-small text-muted">Estimated Price</div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent-primary)" }}>
                        {formatINR(parseFloat(addQty) * getPricePerUnit(addUnit, parseNumeric(addingProduct.basePrice)))}
                      </div>
                    </div>
                    <div className="text-right text-small text-muted">
                      {parseFloat(addQty)} {UNIT_SHORT[addUnit]} ×{" "}
                      {formatINR(getPricePerUnit(addUnit, parseNumeric(addingProduct.basePrice)))}/{UNIT_SHORT[addUnit]}
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Info */}
              <div className="text-small text-muted" style={{ marginTop: "12px" }}>
                {(() => {
                  const { quantity, unit } = autoDisplayUnit(
                    parseNumeric(addingProduct.stockQuantity),
                    addingProduct.baseUnit as BaseUnit
                  );
                  return `Available: ${quantity.toFixed(quantity < 10 ? 2 : 0)} ${UNIT_SHORT[unit]}`;
                })()}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAddingProduct(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map(product => {
            const basePrice = parseNumeric(product.basePrice);
            const { quantity: displayStock, unit: displayUnit } = autoDisplayUnit(
              parseNumeric(product.stockQuantity),
              product.baseUnit as BaseUnit
            );
            const preferredUnit = product.baseUnit === "g" ? "kg" : product.baseUnit === "mL" ? "L" : "unit";
            const displayPrice = getPricePerUnit(preferredUnit as DisplayUnit, basePrice);

            return (
              <div key={product.id} className="product-card">
                <div className="product-card-header">
                  <span className={`badge badge-${product.dimension}`}>{product.dimension}</span>
                  <div className="stock-indicator">
                    <span className={`stock-dot ${parseNumeric(product.stockQuantity) > 10000 ? "high" : parseNumeric(product.stockQuantity) > 1000 ? "medium" : "low"}`} />
                    <span>{displayStock.toFixed(displayStock < 10 ? 1 : 0)} {UNIT_SHORT[displayUnit]}</span>
                  </div>
                </div>
                <div className="product-card-body">
                  <h3>{product.name}</h3>
                  {product.description && (
                    <p className="description">{product.description}</p>
                  )}
                  <div className="product-card-meta">
                    <span className="badge" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                      {product.category?.name || "Uncategorized"}
                    </span>
                    <span className="badge font-mono" style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}>
                      {product.sku}
                    </span>
                  </div>
                  <div className="product-card-price">
                    <div>
                      <span className="price">{formatINR(displayPrice)}</span>
                      <span className="unit"> / {UNIT_SHORT[preferredUnit as DisplayUnit]}</span>
                    </div>
                  </div>
                </div>
                <div className="product-card-footer">
                  <button
                    className="btn btn-primary w-full"
                    onClick={() => openAddToCart(product)}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
