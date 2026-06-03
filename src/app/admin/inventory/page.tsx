import { FaBoxOpen, FaCheck, FaMoneyBillWave, FaTriangleExclamation } from 'react-icons/fa6';
import { getProducts } from "@/actions/products";
import { formatINR, parseNumeric } from "@/lib/format";
import { autoDisplayUnit, getPricePerUnit } from "@/lib/units";

export default async function AdminInventoryPage() {
  const products = await getProducts();

  // Calculate inventory value
  const totalValue = products.reduce((sum, p) => {
    return sum + parseNumeric(p.basePrice) * parseNumeric(p.stockQuantity);
  }, 0);

  const lowStockProducts = products.filter(p => {
    const stockQty = parseNumeric(p.stockQuantity);
    const minQty = parseNumeric(p.minOrderQuantity);
    return stockQty <= minQty * 5;
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Inventory</h1>
          <p className="text-muted text-small">Stock levels and inventory value</p>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><FaBoxOpen /></div>
          <div className="stat-info">
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <h3>{formatINR(totalValue)}</h3>
            <p>Total Inventory Value</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><FaTriangleExclamation /></div>
          <div className="stat-info">
            <h3>{lowStockProducts.length}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><FaCheck /></div>
          <div className="stat-info">
            <h3>{products.filter(p => p.isActive).length}</h3>
            <p>Active Products</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="card" style={{ marginBottom: "24px", borderLeft: "4px solid var(--accent-danger)" }}>
          <h3 style={{ marginBottom: "16px", color: "var(--accent-danger)" }}><FaTriangleExclamation className="icon-inline" /> Low Stock Alerts</h3>
          <div style={{ display: "grid", gap: "8px" }}>
            {lowStockProducts.map(p => {
              const { quantity, unit } = autoDisplayUnit(parseNumeric(p.stockQuantity), p.baseUnit as "g" | "mL" | "unit");
              return (
                <div key={p.id} className="flex items-center justify-between" style={{
                  padding: "10px 14px",
                  background: "var(--accent-danger-light)",
                  borderRadius: "var(--radius-md)",
                }}>
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-small">
                    Only {quantity.toFixed(quantity < 10 ? 2 : 0)} {unit} remaining
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Inventory Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Type</th>
              <th>Stock</th>
              <th>Base Price</th>
              <th>Stock Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const basePrice = parseNumeric(product.basePrice);
              const stockQty = parseNumeric(product.stockQuantity);
              const stockValue = basePrice * stockQty;
              const { quantity: displayStock, unit: displayUnit } = autoDisplayUnit(stockQty, product.baseUnit as "g" | "mL" | "unit");
              const minQty = parseNumeric(product.minOrderQuantity);
              const isLow = stockQty <= minQty * 5;

              return (
                <tr key={product.id}>
                  <td className="font-semibold">{product.name}</td>
                  <td><code className="font-mono text-small">{product.sku}</code></td>
                  <td><span className={`badge badge-${product.dimension}`}>{product.dimension}</span></td>
                  <td>
                    <div className="flex items-center gap-sm">
                      <span className={`stock-dot ${isLow ? "low" : stockQty > 10000 ? "high" : "medium"}`} />
                      <span className={isLow ? "font-semibold" : ""} style={isLow ? { color: "var(--accent-danger)" } : {}}>
                        {displayStock.toFixed(displayStock < 10 ? 2 : 0)} {displayUnit}
                      </span>
                    </div>
                  </td>
                  <td>{formatINR(basePrice)}/{product.baseUnit}</td>
                  <td className="font-semibold">{formatINR(stockValue)}</td>
                  <td>
                    <span className={`badge ${product.isActive ? "badge-active" : "badge-inactive"}`}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
