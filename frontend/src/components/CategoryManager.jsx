import { useState, useEffect } from "react";
import api from "../lib/axios";

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      setCategories(response.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Category name is required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
      } else {
        await api.post("/categories", formData);
      }
      await fetchCategories();
      setFormData({ name: "", description: "" });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setEditingId(category.id);
    setShowForm(true);
    setFormError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/categories/${id}`);
        await fetchCategories();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete category");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setFormError(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <div className="bg-white rounded-lg  p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Manage Categories</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            + Add Category
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-6 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {editingId ? "Edit Category" : "Add New Category"}
          </h3>

          {formError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="e.g., Science Fiction"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                {editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-center text-gray-600">No categories yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Name
                </th>

                <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">
                    {category.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(category)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CategoryManager;
