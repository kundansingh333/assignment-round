"use client";
import { FaLightbulb, FaMagnifyingGlass } from "react-icons/fa6";

import { useState } from "react";
import { createProduct } from "@/actions/products";
import { formatINR, parseNumeric } from "@/lib/format";
import { DIMENSION_UNITS, getPricePerUnit } from "@/lib/units";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  dimension: "weight" | "volume" | "count";
  baseUnit: "g" | "mL" | "unit";
  basePrice: string;
  isActive: boolean;
}

export function SellerProductsClient({ products }: { products: Product[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dimensionFilter, setDimensionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
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
      dimension: "weight",
      basePrice: "",
      stockQuantity: "",
      minOrderQuantity: "1",
    });
    setShowForm(false);
  };

  const dimensionToBaseUnit: Record<string, "g" | "mL" | "unit"> = {
    weight: "g",
    volume: "mL",
    count: "unit",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createProduct({
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        dimension: formData.dimension,
        baseUnit: dimensionToBaseUnit[formData.dimension],
        basePrice: formData.basePrice,
        stockQuantity: formData.stockQuantity,
        minOrderQuantity: formData.minOrderQuantity,
      });

      resetForm();
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  let filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchDimension =
      dimensionFilter === "all" || p.dimension === dimensionFilter;
    return matchSearch && matchDimension;
  });

  filtered = filtered.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price_asc")
      return parseNumeric(a.basePrice) - parseNumeric(b.basePrice);
    if (sortBy === "price_desc")
      return parseNumeric(b.basePrice) - parseNumeric(a.basePrice);
    return 0;
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>My Products</h1>
          <p className="text-muted text-small">{filtered.length} products</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Product
        </button>
      </div>

      {showForm && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetForm();
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button className="btn btn-ghost btn-icon" onClick={resetForm}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      className="form-input"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Sodium Chloride"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU *</label>
                    <input
                      className="form-input"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sku: e.target.value,
                        }))
                      }
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Product description..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Dimension *</label>
                    <select
                      className="form-select"
                      value={formData.dimension}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dimension: e.target.value as
                            | "weight"
                            | "volume"
                            | "count",
                        }))
                      }
                    >
                      <option value="weight">Weight (g / kg)</option>
                      <option value="volume">Volume (mL / L)</option>
                      <option value="count">Count (units)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Base Price (₹ per{" "}
                      {dimensionToBaseUnit[formData.dimension]}) *
                    </label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.000001"
                      min="0"
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          basePrice: e.target.value,
                        }))
                      }
                      placeholder="e.g., 0.05"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          stockQuantity: e.target.value,
                        }))
                      }
                      placeholder="e.g., 50000"
                      required
                    />
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          minOrderQuantity: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {formData.basePrice && (
                  <div
                    className="conversion-display"
                    style={{ marginTop: "8px" }}
                  >
                    <FaLightbulb className="icon-inline" /> Price Preview:{" "}
                    {DIMENSION_UNITS[formData.dimension].map((unit) => (
                      <span key={unit} style={{ marginLeft: "12px" }}>
                        {formatINR(
                          getPricePerUnit(unit, parseFloat(formData.basePrice)),
                        )}{" "}
                        / {unit}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : null}
                  {loading ? "Creating..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="filters-bar">
        <div className="search-container">
          <span className="search-icon">
            <FaMagnifyingGlass />
          </span>
          <input
            className="search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          value={dimensionFilter}
          onChange={(e) => setDimensionFilter(e.target.value)}
          style={{ width: "auto", minWidth: "130px" }}
        >
          <option value="all">All Types</option>
          <option value="weight">Weight</option>
          <option value="volume">Volume</option>
          <option value="count">Count</option>
        </select>

        <select
          className="form-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ width: "auto", minWidth: "130px" }}
        >
          <option value="name">Sort: Name</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Type</th>
              <th>Base Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-muted"
                  style={{ padding: "48px" }}
                >
                  No products found
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                  </td>
                  <td>
                    <code className="font-mono text-small">{product.sku}</code>
                  </td>
                  <td>
                    <span className={`badge badge-${product.dimension}`}>
                      {product.dimension}
                    </span>
                  </td>
                  <td>
                    <div className="font-semibold">
                      {formatINR(parseNumeric(product.basePrice))}/
                      {product.baseUnit}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${product.isActive ? "badge-active" : "badge-inactive"}`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
