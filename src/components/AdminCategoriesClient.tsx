"use client";

import { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/products";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export function AdminCategoriesClient({ categories }: { categories: Category[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name, description });
      } else {
        await createCategory({ name, description });
      }
      resetForm();
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setName(cat.name);
    setDescription(cat.description || "");
    setEditingCategory(cat);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Products in this category will be unlinked.")) return;
    try {
      await deleteCategory(id);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Categories</h1>
          <p className="text-muted text-small">{categories.length} categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Category
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingCategory ? "Edit Category" : "Add Category"}</h3>
              <button className="btn btn-ghost btn-icon" onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    className="form-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Organic Solvents"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Category description..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" /> : null}
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-muted" style={{ padding: "48px" }}>
                  No categories yet. Create your first one!
                </td>
              </tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id}>
                  <td className="font-semibold">{cat.name}</td>
                  <td className="text-muted text-small">{cat.description || "—"}</td>
                  <td>
                    <div className="flex gap-sm">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(cat)}>✏️</button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(cat.id)}
                        style={{ color: "var(--accent-danger)" }}
                      >
                        🗑️
                      </button>
                    </div>
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
