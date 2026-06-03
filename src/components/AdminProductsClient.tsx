"use client";

import { useState } from "react";
import { createProduct, updateProduct, deleteProduct } from "@/actions/products";
import { formatINR, parseNumeric } from "@/lib/format";
import { getPricePerUnit, DIMENSION_UNITS, UNIT_LABELS, autoDisplayUnit } from "@/lib/units";
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

const dimensionToBaseUnit: Record<string, "g" | "mL" | "unit"> = {
  weight: "g",
  volume: "mL",
  count: "unit",
};

export function AdminProductsClient({ products: initialProducts, categories }: { products: Product[]; categories: Category[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    categoryId: "",
    dimension: "weight" as "weight" | "volume" | "count",
    basePrice: "",
    stockQuantity: "",
    minOrderQuantity: "1",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      categoryId: "",
      dimension: "weight",
      basePrice: "",
      stockQuantity: "",
      minOrderQuantity: "1",
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const openEditForm = (product: Product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      categoryId: product.categoryId || "",
      dimension: product.dimension,
      basePrice: product.basePrice,
      stockQuantity: product.stockQuantity,
      minOrderQuantity: product.minOrderQuantity || "1",
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        categoryId: formData.categoryId || undefined,
        dimension: formData.dimension,
        baseUnit: dimensionToBaseUnit[formData.dimension],
        basePrice: formData.basePrice,
        stockQuantity: formData.stockQuantity,
        minOrderQuantity: formData.minOrderQuantity,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }

      resetForm();
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product.id, { isActive: !product.isActive });
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  const filtered = initialProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Products</h1>
          <p className="text-muted text-small">{initialProducts.length} total products</p>
        </div>
        <div className="topbar-actions">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            + Add Product
          </button>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button className="btn btn-ghost btn-icon" onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      className="form-input"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Sodium Chloride"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU *</label>
                    <input
                      className="form-input"
                      value={formData.sku}
                      onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="e.g., CHEM-NaCl-001"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.categoryId}
                      onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    >
                      <option value="">No Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dimension *</label>
                    <select
                      className="form-select"
                      value={formData.dimension}
                      onChange={e => setFormData(prev => ({ ...prev, dimension: e.target.value as "weight" | "volume" | "count" }))}
                    >
                      <option value="weight">Weight (g / kg)</option>
                      <option value="volume">Volume (mL / L)</option>
                      <option value="count">Count (units)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Base Price (₹ per {dimensionToBaseUnit[formData.dimension]}) *
                    </label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.000001"
                      min="0"
                      value={formData.basePrice}
                      onChange={e => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                      placeholder="e.g., 0.05"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Stock ({dimensionToBaseUnit[formData.dimension]}) *
                    </label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.000001"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={e => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                      placeholder="e.g., 50000"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Min Order Qty ({dimensionToBaseUnit[formData.dimension]})
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={formData.minOrderQuantity}
                    onChange={e => setFormData(prev => ({ ...prev, minOrderQuantity: e.target.value }))}
                  />
                </div>

                {/* Price Preview */}
                {formData.basePrice && (
                  <div className="conversion-display" style={{ marginTop: "8px" }}>
                    💡 Price Preview: {DIMENSION_UNITS[formData.dimension].map(unit => (
                      <span key={unit} style={{ marginLeft: "12px" }}>
                        {formatINR(getPricePerUnit(unit, parseFloat(formData.basePrice)))} / {unit}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" /> : null}
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Type</th>
              <th>Base Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted" style={{ padding: "48px" }}>
                  No products found
                </td>
              </tr>
            ) : (
              filtered.map(product => {
                const basePrice = parseNumeric(product.basePrice);
                const stockQty = parseNumeric(product.stockQuantity);
                const { quantity: displayStock, unit: displayUnit } = autoDisplayUnit(stockQty, product.baseUnit);

                return (
                  <tr key={product.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                    </td>
                    <td><code className="font-mono text-small">{product.sku}</code></td>
                    <td>{product.category?.name || "—"}</td>
                    <td><span className={`badge badge-${product.dimension}`}>{product.dimension}</span></td>
                    <td>
                      <div className="font-semibold">{formatINR(basePrice)}/{product.baseUnit}</div>
                      {product.dimension !== "count" && (
                        <div className="text-xs text-muted">
                          = {formatINR(getPricePerUnit(
                            product.baseUnit === "g" ? "kg" : "L",
                            basePrice
                          ))}/{product.baseUnit === "g" ? "kg" : "L"}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-sm">
                        <span className={`stock-dot ${stockQty > 10000 ? "high" : stockQty > 1000 ? "medium" : "low"}`} />
                        {displayStock.toFixed(displayStock < 10 ? 1 : 0)} {displayUnit}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${product.isActive ? "badge-active" : "badge-inactive"}`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditForm(product)}>
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggleActive(product)}
                        >
                          {product.isActive ? "🚫" : "✅"}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(product.id)}
                          style={{ color: "var(--accent-danger)" }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
